const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL ?? "http://127.0.0.1:8080"

export const maxDuration = 60

interface IncomingMessage {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT =
  "Você é um assistente de IA prestativo, amigável e conciso. " +
  "Responda sempre em português do Brasil, de forma clara e objetiva. " +
  "Use markdown simples quando ajudar na leitura."

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "Formato de requisição inválido ou corpo vazio." },
        { status: 400 }
      )
    }

    const messages = body.messages as IncomingMessage[]

    if (messages.length === 0) {
      return Response.json(
        { error: "Nenhuma mensagem foi enviada do frontend." },
        { status: 400 }
      )
    }

    // 1. Monta o histórico
    let prompt = `<|im_start|>system\n${SYSTEM_PROMPT}<|im_end|>\n`
    for (const msg of messages) {
      prompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`
    }
    prompt += `<|im_start|>assistant\n`

    console.log(`[API Chat] Enviando requisição para: ${LLAMA_SERVER_URL}/completion`)

    // 2. Chamada direta ao llama-server que já está de pé
    const res = await fetch(`${LLAMA_SERVER_URL}/completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        stream: false,
        n_predict: 512
      }),
      signal: AbortSignal.timeout(90_000), // Timeout de 90 segundos
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`O motor Llama retornou o status HTTP ${res.status}. Detalhes: ${text}`)
    }

    const data = await res.json()
    const text = data.content ?? "Sem resposta."

    return Response.json({ response: text })
  } catch (error) {
    console.error("[v0] Erro na rota /api/chat:", error)
    
    let errorMessage = "Erro interno ao processar a requisição."
    if (error instanceof Error) {
      errorMessage = `${error.name}: ${error.message}`
      
      if (error.message.includes("fetch failed")) {
        errorMessage = "Conexão Recusada: O llama-server está offline na porta 8080. Reinicie o script ./iniciar.sh."
      }
    }

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}