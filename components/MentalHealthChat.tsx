"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Moon, Sun } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function MentalHealthChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "Hello. I'm here to listen. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        transports: ["websocket"],
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[v0] Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[v0] Socket disconnected");
      setIsConnected(false);
    });

    socket.on("response", (data: { text: string }) => {
      console.log("[v0] Received AI response:", data);
      setIsLoading(false);
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        text: data.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("error", (error: string | { message?: string }) => {
      console.error("[v0] Socket error:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message || "An error occurred";
      toast.error(errorMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    socketRef.current.emit("message", { message: input });

    setInput("");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Toaster richColors position="top-center" duration={2000} />
      <div className="flex h-full w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Mental Health Support
            </h1>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Connecting..."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  dir="auto"
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="leading-relaxed *:text-inherit">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  dir="auto"
                  className="max-w-[80%] rounded-2xl bg-muted px-5 py-3"
                >
                  <Loader />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              dir="auto"
              className="flex-1 rounded-full border border-input bg-background px-6 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={!isConnected}
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={!input.trim() || !isConnected}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
