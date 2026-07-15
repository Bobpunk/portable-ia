"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Trash2, TriangleAlert, Cpu, AlertCircle } from "lucide-react"
import type { Message } from "@/lib/chat-types"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatInput } from "@/components/chat/chat-input"
import { MessageBubble } from "@/components/chat/message-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { WelcomeScreen } from "@/components/chat/welcome-screen"

interface LocalModel {
  id: string
  name: string
}

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para gerenciar os modelos carregados dinamicamente
  const [models, setModels] = useState<LocalModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [loadingModels, setLoadingModels] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Busca os modelos .gguf físicos na inicialização do app
  useEffect(() => {
    async function loadModels() {
      try {
        setLoadingModels(true)
        const res = await fetch("/api/models")
        if (!res.ok) throw new Error("Falha ao escanear modelos locais.")
        
        const data = await res.json() as { models: LocalModel[] }
        if (data.models && data.models.length > 0) {
          setModels(data.models)
          setSelectedModel(data.models[0].id) // Seleciona o primeiro por padrão
        } else {
          console.warn("[Frontend] Nenhum arquivo .gguf encontrado na pasta 'models'")
        }
      } catch (err) {
        console.error("Erro carregando modelos:", err)
        setError("Não foi possível listar a pasta 'models'.")
      } finally {
        setLoadingModels(false)
      }
    }
    loadModels()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    setError(null)
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel, // Envia o arquivo de modelo atualmente selecionado
        }),
        signal: AbortSignal.timeout(120_000),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Falha na resposta do servidor.")
      }

      const data = (await res.json()) as { response: string }
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      console.log("[v0] Erro ao enviar mensagem:", err)
      const message =
        err instanceof DOMException && err.name === "TimeoutError"
          ? "A requisição demorou demais. Tente novamente."
          : err instanceof Error
            ? err.message
            : "Ocorreu um erro inesperado."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="mx-auto flex h-dvh max-w-4xl flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-foreground">
              Chat IA
            </h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Digitando..." : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          {/* SELETOR INTELIGENTE */}
          {loadingModels ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground animate-pulse">
              <Cpu className="size-3.5" />
              <span>Buscando GGUF...</span>
            </div>
          ) : models.length > 0 ? (
            <div className="relative flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5">
              <Cpu className="size-3.5 text-[#00b37e]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer pr-1"
              >
                {models.map((modelo) => (
                  <option key={modelo.id} value={modelo.id} className="bg-card text-foreground text-xs">
                    {modelo.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              <span>Sem modelos (.gguf)</span>
            </div>
          )}

          {hasMessages && (
            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {!hasMessages && !isLoading ? (
          <WelcomeScreen onSuggestion={sendMessage} />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}