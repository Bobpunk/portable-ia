import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="size-4" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-card px-4 py-3.5 shadow-sm ring-1 ring-border">
        <span className="sr-only">A IA está digitando</span>
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  )
}
