import { Bot, Lightbulb, PenLine, Sparkles } from "lucide-react"

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Explique um conceito",
    prompt: "Explique o que é inteligência artificial de forma simples.",
  },
  {
    icon: PenLine,
    title: "Ajude a escrever",
    prompt: "Escreva um e-mail profissional pedindo feedback sobre um projeto.",
  },
  {
    icon: Sparkles,
    title: "Dê ideias",
    prompt: "Me dê 5 ideias de nomes para uma cafeteria aconchegante.",
  },
]

export function WelcomeScreen({
  onSuggestion,
}: {
  onSuggestion: (prompt: string) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <Bot className="size-7" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-balance text-2xl font-semibold text-foreground">
          Olá! Como posso ajudar hoje?
        </h2>
        <p className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          Faça uma pergunta, peça ajuda para escrever ou explore ideias. Escolha
          uma sugestão abaixo para começar.
        </p>
      </div>
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
          <button
            key={title}
            type="button"
            onClick={() => onSuggestion(prompt)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <Icon
              className="size-5 text-primary transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-card-foreground">
              {title}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
