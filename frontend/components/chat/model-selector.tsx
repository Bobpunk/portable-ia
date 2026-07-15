"use client"

import { ChevronDown } from "lucide-react"
import { MODELS } from "@/lib/models"

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
}

const providers = [...new Set(MODELS.map((m) => m.provider))]

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selected = MODELS.find((m) => m.id === value)

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex w-full cursor-pointer appearance-none items-center rounded-lg border border-border bg-card px-3 py-1.5 pr-8 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {providers.map((provider) => (
          <optgroup key={provider} label={provider}>
            {MODELS.filter((m) => m.provider === provider).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <span className="sr-only">
        Modelo atual: {selected?.name ?? "Desconhecido"}
      </span>
    </div>
  )
}
