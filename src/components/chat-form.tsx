import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpIcon } from "lucide-react"
import { useChat, useHealth } from "@/hooks/chat";
import type { Message } from "@/lib/types"


export function Chat({ className, ...props }: React.ComponentProps<"form">) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: health } = useHealth();
  const chat = useChat();

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
  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          <div>{message.content}</div>
          {/* {message.content} */}
        </div>
      ))}
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || chat.isPending || health.status !== "ready") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Focus the input after sending
    inputRef.current?.focus();

    chat.mutate({ query: input }, {
      onSuccess: (data) => {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.long_answer,
          role: "assistant",
          markdown: data.markdown,
          status: data.status
        };
        setMessages((prev) => [...prev, botMessage]);
      },
      onError: () => {
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: "Sorry, I encountered an error while processing your request. Please try again later.",
          role: "assistant",
          status: "error"
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    })

  };


  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none",
        className,
      )}
      {...props}
    >
      <div className="flex-1 content-center overflow-y-auto px-6">{messages.length ? messageList : header}</div>
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
  )
}
