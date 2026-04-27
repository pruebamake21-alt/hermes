/**
 * Generic OpenAI-compatible LLM client.
 * Supports any provider via env vars: LLM_API_KEY, LLM_API_URL, LLM_MODEL.
 * No SDK dependency — plain fetch.
 */

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface LlmResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function llmChat(
  messages: LlmMessage[],
  config?: Partial<LlmConfig>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LlmResponse> {
  const apiKey = config?.apiKey || process.env.LLM_API_KEY || "";
  const baseUrl = config?.baseUrl || process.env.LLM_API_URL || "https://api.openai.com/v1";
  const model = config?.model || process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY no configurada. Configúrala en Ajustes > Importación Inteligente o en el archivo .env"
    );
  }

  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`Error de LLM (${res.status}): ${err}`);
  }

  const json = await res.json();

  return {
    content: json.choices?.[0]?.message?.content ?? "",
    usage: json.usage
      ? {
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens,
          totalTokens: json.usage.total_tokens,
        }
      : undefined,
  };
}
