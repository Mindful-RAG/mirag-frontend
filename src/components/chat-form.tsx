import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpIcon, Loader2 } from "lucide-react";
import { useLongRAGChat, useMiRAGChat } from "@/hooks/chat";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/lib/types";

interface Conversation {
  id: string;
  question: string;
  responses: Message[];
}

export function Chat({ className, ...props }: React.ComponentProps<"form">) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string>("");

  const [progress, setProgress] = useState("");

  const mirag = useMiRAGChat();
  const longrag = useLongRAGChat();

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

  const isLoading = mirag.isPending || longrag.isPending;

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

    // Process MiRAG response
    mirag.mutateAsync(
      { query: userInput, session_id: sessionId },
      {
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
                console.log("Line:", line);
                const parsed = JSON.parse(line);
                setProgress(parsed.progress);

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
      },
    );

    // Process LongRAG streaming response
    longrag.mutateAsync(
      { query: userInput, session_id: sessionId },
      {
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
      },
    );
  };

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-full flex-col items-stretch border-none overflow-y-auto",
        className,
      )}
      {...props}
    >
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
                        ?.isStreaming && progress}
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

                {/* LongRAG Response */}
                <div className="flex-1 rounded-xl bg-pink-100 p-4 text-sm">
                  <div className="font-bold text-black">
                    LongRAG{" "}
                    <span className="text-sm font-thin">
                      {conversation.responses.find((r) => r.type === "longrag")
                        ?.isStreaming && progress}
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
