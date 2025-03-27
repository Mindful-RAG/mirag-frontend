import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpIcon, Loader2 } from "lucide-react"
import { useMiRAGChat, useLongRAGChat } from "@/hooks/chat";
import type { Message } from "@/lib/types"

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
  const mirag = useMiRAGChat();
  const longrag = useLongRAGChat();

  const isLoading = mirag.isPending || longrag.isPending;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Mindful RAG (MiRAG)</h1>
      <p className="text-muted-foreground text-sm">
        MiRAG is a retrieval-augmented generation system that uses a mindful approach to improve the quality of retrieved information.
      </p>
      <p className="text-muted-foreground text-sm">
        This is still under development. Results may vary.
      </p>
    </header>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || mirag.isPending) return;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      question: input,
      responses: [],
    };

    setConversations((prev) => [...prev, newConversation]);
    setInput("");

    inputRef.current?.focus();

    // Handle chat response
    mirag.mutate(
      { query: input },
      {
        onSuccess: (data) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversation.id
                ? {
                  ...conv,
                  responses: [
                    ...conv.responses,
                    {
                      id: Date.now().toString(),
                      content: data.long_answer,
                      role: "assistant",
                      type: "mirag",
                    },
                  ],
                }
                : conv
            )
          );
        },

        onError: () => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversation.id
                ? {
                  ...conv,
                  responses: [
                    ...conv.responses,
                    {
                      id: Date.now().toString(),
                      content: "Error: No response received. Please try again.",
                      role: "assistant",
                      type: "mirag",
                    },
                  ],
                }
                : conv
            )
          );
        },
      }
    );

    // Handle longrag response
    longrag.mutate(
      { query: input },
      {
        onSuccess: (data) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversation.id
                ? {
                  ...conv,
                  responses: [
                    ...conv.responses,
                    {
                      id: Date.now().toString(),
                      content: data.long_answer,
                      role: "assistant",
                      type: "longrag",
                    },
                  ],
                }
                : conv
            )
          );
        },

        onError: () => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newConversation.id
                ? {
                  ...conv,
                  responses: [
                    ...conv.responses,
                    {
                      id: Date.now().toString(),
                      content: "Error: No response received. Please try again.",
                      role: "assistant",
                      type: "longrag",
                    },
                  ],
                }
                : conv
            )
          );
        },
      }
    );
  };
  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none",
        className
      )}
      {...props}
    >
      {conversations.length === 0 ? (
        <div className="flex-1 content-center overflow-y-auto px-6">{header}</div>
      )
        :
        <div className="flex-1 content-start overflow-y-auto px-6">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="my-6 flex flex-col items-end gap-4">
              {/* User Question */}
              <div className="rounded-lg bg-red-300 px-4 py-2 text-sm text-black">
                {conversation.question}
              </div>

              {/* Responses Side by Side */}
              <div className="flex md:flex-row flex-col w-full max-w justify-center gap-4">

                {conversation.responses.find((m) => m.type === "mirag") && (
                  <div className="flex-1 rounded-xl bg-purple-100 p-4 text-sm">
                    <div className="font-bold text-black">Mirag</div>
                    <div>{conversation.responses.find((m) => m.type === "mirag")?.content}</div>
                  </div>
                )}
                {conversation.responses.find((m) => m.type === "longrag") && (
                  <div className="flex-1 rounded-xl bg-pink-100 p-4 text-sm">
                    <div className="font-bold text-black">Longrag</div>
                    <div>{conversation.responses.find((m) => m.type === "longrag")?.content}</div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-row justify-center gap-4 pb-4">
              {mirag.isPending && (
                <div className="max-w-[40%] rounded-xl px-3 py-2 text-sm bg-purple-100 text-black flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <div>
                    <div className="font-bold">mirag</div>
                    <div>Thinking...</div>
                  </div>
                </div>
              )}

              {longrag.isPending && (
                <div className="max-w-[40%] rounded-xl px-3 py-2 text-sm bg-pink-100 text-black flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <div>
                    <div className="font-bold">longrag</div>
                    <div>Thinking...</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      }

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
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 size-6 rounded-full">
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </main>
  );
}
