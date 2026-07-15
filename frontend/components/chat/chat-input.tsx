"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_CHARS = 2000

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-card px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Digite sua mensagem..."
            aria-label="Campo de mensagem"
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || value.trim().length === 0}
            aria-label="Enviar mensagem"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Enter para enviar • Shift + Enter para nova linha
          </span>
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              value.length >= MAX_CHARS && "text-destructive",
            )}
          >
            {value.length}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  )
}
