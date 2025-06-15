import React, { useState, useRef, useEffect, useContext } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpIcon, Loader2, Upload, X, FileText, AlertCircle } from "lucide-react";
import { useLongRAGChat, useMiRAGChat, useUploadPDF, useDeleteCustomCorpus } from "@/hooks/chat";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/lib/types";
import { ToggleMiragContext } from "@/routes";
import { useAuthContext } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Conversation {
  id: string;
  question: string;
  responses: Message[];
}

interface CustomCorpus {
  id: string;
  filename: string;
  uploadDate: Date;
}

export function Chat({ className, ...props }: React.ComponentProps<"form">) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useAuthContext();

  // Get toggle-mirag from context
  const { toggleMirag } = useContext(ToggleMiragContext);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string>("");
  const [customCorpus, setCustomCorpus] = useState<CustomCorpus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [miragProgress, setMiragProgress] = useState("");
  const [longragProgress, setLongragProgress] = useState("");

  const mirag = useMiRAGChat();
  const longrag = useLongRAGChat();
  const uploadPDF = useUploadPDF();
  const deleteCorpus = useDeleteCustomCorpus();

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const isLoading = mirag.isPending || longrag.isPending || isUploading;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file only.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    uploadPDF.mutate(file, {
      onSuccess: (data) => {
        const newCorpus: CustomCorpus = {
          id: data.corpus_id,
          filename: data.file,
          uploadDate: new Date(),
        };
        setCustomCorpus(newCorpus);
        setIsUploading(false);
        setUploadError(null);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        setUploadError(error.message);
        setIsUploading(false);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleRemoveCorpus = () => {
    if (!customCorpus) return;

    deleteCorpus.mutate(customCorpus.id, {
      onSuccess: () => {
        setCustomCorpus(null);
        setUploadError(null);
      },
      onError: (error) => {
        console.error("Delete failed:", error);
        setUploadError(`Failed to remove corpus: ${error.message}`);
      },
    });
  };

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Mindful RAG (MiRAG)
      </h1>
      <p className="text-muted-foreground text-sm">
        MiRAG is a retrieval-augmented generation system that uses a mindful
        approach to improve the quality of retrieved information.
      </p>
      <p className="text-muted-foreground text-sm">
        This is still under development. Results may vary.
      </p>
    </header>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;

    // Create a new conversation
    const newConversationId = Date.now().toString();
    const newConversation: Conversation = {
      id: newConversationId,
      question: input,
      responses: [
        {
          id: `mirag-${Date.now()}`,
          content: "",
          role: "assistant",
          type: "mirag",
          isStreaming: true,
        },
        {
          id: `longrag-${Date.now()}`,
          content: "",
          role: "assistant",
          type: "longrag",
          isStreaming: true,
        },
      ],
    };

    setConversations((prev) => [...prev, newConversation]);
    const userInput = input;
    setInput("");
    inputRef.current?.focus();

    // Prepare query parameters with optional custom corpus ID
    const queryParams = {
      query: userInput,
      session_id: sessionId,
      ...(customCorpus && { custom_corpus_id: customCorpus.id }),
    };

    // Process MiRAG response
    mirag.mutateAsync(queryParams, {
      onSuccess: async (res) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversationId
                ? {
                  ...conv,
                  responses: conv.responses.map((resp) =>
                    resp.type === "mirag"
                      ? {
                        ...resp,
                        content: "Error: No streaming data available",
                        isStreaming: false,
                      }
                      : resp,
                  ),
                }
                : conv,
            ),
          );
          return;
        }

        let accumContent = "";
        let isDone = false;

        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.trim()) continue;
            if (line === "[DONE]") {
              isDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(line);
              setMiragProgress(parsed.progress);

              accumContent += parsed.token || "";

              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === newConversationId
                    ? {
                      ...conv,
                      responses: conv.responses.map((resp) =>
                        resp.type === "mirag"
                          ? { ...resp, content: accumContent }
                          : resp,
                      ),
                    }
                    : conv,
                ),
              );
            } catch (e) {
              console.error("Failed to parse streaming data:", e);
            }
          }
        }

        // Mark streaming as complete
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newConversationId
              ? {
                ...conv,
                responses: conv.responses.map((resp) =>
                  resp.type === "mirag"
                    ? { ...resp, isStreaming: false }
                    : resp,
                ),
              }
              : conv,
          ),
        );
      },
      onError: () => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newConversationId
              ? {
                ...conv,
                responses: conv.responses.map((resp) =>
                  resp.type === "mirag"
                    ? {
                      ...resp,
                      content:
                        "Error: No response received. Please try again.",
                      isStreaming: false,
                    }
                    : resp,
                ),
              }
              : conv,
          ),
        );
      },
    });

    // Process LongRAG streaming response
    longrag.mutateAsync(queryParams, {
      onSuccess: async (res) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        if (!reader) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversationId
                ? {
                  ...conv,
                  responses: conv.responses.map((resp) =>
                    resp.type === "longrag"
                      ? {
                        ...resp,
                        content: "Error: No streaming data available",
                        isStreaming: false,
                      }
                      : resp,
                  ),
                }
                : conv,
            ),
          );
          return;
        }

        let accumContent = "";
        let isDone = false;

        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.trim()) continue;
            if (line === "[DONE]") {
              isDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(line);
              setLongragProgress(parsed.progress);
              accumContent += parsed.token || "";

              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === newConversationId
                    ? {
                      ...conv,
                      responses: conv.responses.map((resp) =>
                        resp.type === "longrag"
                          ? { ...resp, content: accumContent }
                          : resp,
                      ),
                    }
                    : conv,
                ),
              );
            } catch (e) {
              console.error("Failed to parse streaming data:", e);
            }
          }
        }

        // Mark streaming as complete
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newConversationId
              ? {
                ...conv,
                responses: conv.responses.map((resp) =>
                  resp.type === "longrag"
                    ? { ...resp, isStreaming: false }
                    : resp,
                ),
              }
              : conv,
          ),
        );
      },
      onError: () => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newConversationId
              ? {
                ...conv,
                responses: conv.responses.map((resp) =>
                  resp.type === "longrag"
                    ? {
                      ...resp,
                      content:
                        "Error: No response received. Please try again.",
                      isStreaming: false,
                    }
                    : resp,
                ),
              }
              : conv,
          ),
        );
      },
    });
  };

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-full flex-col items-stretch border-none overflow-y-auto",
        className,
      )}
      {...props}
    >
      {/* Corpus Management Bar */}
      <div className="border-b bg-gray-50 p-4">
        <div className="mx-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Using: {customCorpus ? (
                <span className="text-blue-700 font-semibold">{customCorpus.filename} (Custom)</span>
              ) : (
                <span className="text-gray-700">Default Corpus</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {customCorpus ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || deleteCorpus.isPending}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Replace PDF
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveCorpus}
                      disabled={isUploading || deleteCorpus.isPending}
                      className="flex items-center gap-2"
                    >
                      {deleteCorpus.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? "Uploading..." : "Upload Custom PDF"}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Sign in to upload custom documents
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="mx-6 mt-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Custom Corpus Display */}
        {customCorpus && (
          <div className="mx-6 mt-3">
            <div className="flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs text-blue-700">
              <FileText className="h-3 w-3" />
              <span>{customCorpus.filename}</span>
              <span className="text-blue-500">• Uploaded {customCorpus.uploadDate.toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 content-center overflow-y-auto px-6">
          {header}
        </div>
      ) : (
        <div className="flex-1 content-start overflow-y-auto px-6">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="my-6 flex flex-col items-end gap-4"
            >
              {/* User Question */}
              <div className="rounded-lg bg-red-300 px-4 py-2 text-sm text-black">
                {conversation.question}
              </div>

              {/* Responses Side by Side */}
              <div className="flex md:flex-row flex-col w-full max-w justify-center gap-4">
                {/* MiRAG Response */}
                <div className="flex-1 rounded-xl bg-purple-100 p-4 text-sm">
                  <div className="font-bold text-black">
                    MiRAG{" "}
                    <span className="text-sm font-thin">
                      {conversation.responses.find((r) => r.type === "mirag")
                        ?.isStreaming && miragProgress}
                    </span>
                  </div>
                  <div className="prose">
                    <ReactMarkdown>
                      {
                        conversation.responses.find((r) => r.type === "mirag")
                          ?.content
                      }
                    </ReactMarkdown>
                    {conversation.responses.find((r) => r.type === "mirag")
                      ?.isStreaming && <span className="animate-pulse">▌</span>}
                  </div>
                </div>

                {/* LongRAG Response (conditionally rendered) */}
                {!toggleMirag && (
                  <div className="flex-1 rounded-xl bg-pink-100 p-4 text-sm">
                    <div className="font-bold text-black">
                      LongRAG{" "}
                      <span className="text-sm font-thin">
                        {conversation.responses.find((r) => r.type === "longrag")
                          ?.isStreaming && longragProgress}
                      </span>
                    </div>
                    <div className="prose">
                      <ReactMarkdown>
                        {
                          conversation.responses.find((r) => r.type === "longrag")
                            ?.content
                        }
                      </ReactMarkdown>
                      {conversation.responses.find((r) => r.type === "longrag")
                        ?.isStreaming && <span className="animate-pulse">▌</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder="Enter a message"
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
            disabled={isLoading}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading || input.trim() === ""}
                className="absolute bottom-1 right-1 size-6 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpIcon size={16} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </main>
  );
}
