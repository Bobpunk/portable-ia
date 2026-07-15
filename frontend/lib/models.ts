export interface ModelOption {
  id: string
  name: string
  provider: string
  description: string
}

export const MODELS: ModelOption[] = [
  {
    id: "local/qwen2.5-0.5b",
    name: "Qwen 2.5 0.5B (Local)",
    provider: "Local",
    description: "Modelo offline via llama.cpp",
  },
]

export const DEFAULT_MODEL_ID = MODELS[0].id
export const LOCAL_MODEL_PREFIX = "local/"

export function isValidModelId(id: unknown): id is string {
  return typeof id === "string" && MODELS.some((m) => m.id === id)
}

export function isLocalModel(id: string): boolean {
  return id.startsWith(LOCAL_MODEL_PREFIX)
}
