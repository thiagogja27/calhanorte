import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Chave do Gemini (GEMINI_API_KEY) não configurada no servidor. Por favor, configure-a no painel de Secrets da plataforma." 
      }, { status: 500 });
    }

    // Initialize GoogleGenAI SDK with headers and api key as specified in the gemini-api skill
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Format messages for the contents parameter
    const formattedContents = messages.map((m: any) => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text || m.content }]
      };
    });

    const systemInstruction = 
      "Você é o AssisteAço, um consultor virtual especialista em metalurgia e vendas de aço, ferro " +
      "e ferragens para o mercado do Brasil (padrões ABNT NBR, Gerdau, CSN, Tubos de Aço, Chapas, " +
      "Vigas estruturais I, U, W, e vergalhões CA-50/CA-60).\n\n" +
      "Seu papel é auxiliar o VENDEDOR DE AÇO e o CLIENTE dele (serralheiros, construtores, calheiros). " +
      "Seja extremamente profissional, preciso, prático e use tom amigável. " +
      "Você domina cálculos de peso estrutural. Por exemplo:\n" +
      "- Chapas de aço carbono têm densidade volumétrica de ~7.85 g/cm³ (7850 kg/m³). Fórmula de peso: Espessura (mm) x Largura (m) x Comprimento (m) x 7.85.\n" +
      "- Tubos: Peso(kg/m) = (Diâmetro Externo - Espessura da parede) * Espessura * 0.02466.\n" +
      "- Vergalhão Gerdau CA-50/CA-60 tem pesos nominais por metro padrão:\n" +
      "  - 4.2 mm: 0.109 kg/m\n" +
      "  - 5.0 mm: 0.154 kg/m\n" +
      "  - 6.3 mm (1/4\"): 0.245 kg/m\n" +
      "  - 8.0 mm (5/16\"): 0.395 kg/m\n" +
      "  - 10.0 mm (3/8\"): 0.617 kg/m\n" +
      "  - 12.5 mm (1/2\"): 0.963 kg/m\n" +
      "  - 16.0 mm (5/8\"): 1.578 kg/m\n" +
      "Ajude com dimensionamento estrutural simples, conversão de polegadas para milímetros, pesos de bobinas, " +
      "escolha entre ligas SAE 1020 e 1045 ou chapas pretas vs chapas galvanizadas.\n\n" +
      "Responda formatando com tabelas limpas do markdown ou listas, sempre em Português.";

    // Generate content using the recommended model for basic smart text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "Desculpe, não consegui processar a resposta.";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error in Next.js route:", error);
    return NextResponse.json({ 
      error: error.message || "Erro de comunicação com o servidor Gemini." 
    }, { status: 500 });
  }
}
