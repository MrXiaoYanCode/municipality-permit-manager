"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Bot, User, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const FALLBACK_MSG =
  "Our AI assistant is experiencing high demand right now. Please wait a moment and try again — your request matters to us.";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm PermitAI, your municipal compliance assistant. Ask me anything about your permits, deadlines, or compliance requirements.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    setLastFailedMessage(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLastFailedMessage(userMessage);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error ?? FALLBACK_MSG,
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setLastFailedMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: FALLBACK_MSG, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    await sendMessage(userMessage);
  };

  const handleRetry = async () => {
    if (!lastFailedMessage || loading) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    await sendMessage(lastFailedMessage);
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Sparkles className="h-6 w-6 text-primary sm:h-7 sm:w-7" /> AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Ask compliance questions about your permits and documents.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">PermitAI Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.isError ? "bg-amber-500/10" : "bg-primary/10"
                    }`}
                  >
                    <Bot className={`h-4 w-4 ${msg.isError ? "text-amber-500" : "text-primary"}`} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.isError
                        ? "border border-amber-500/30 bg-amber-500/10 text-foreground"
                        : "bg-muted"
                  }`}
                >
                  {msg.content}
                  {msg.isError && lastFailedMessage && i === messages.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 gap-1.5 px-2 text-xs"
                      onClick={handleRetry}
                      disabled={loading}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your permits..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
