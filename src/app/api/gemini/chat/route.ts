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
      "Você é o Especialista AI Calheiro, um consultor virtual especialista em calhas, rufos, condutores, e cotações de chapas e bobinas metálicas lisas ou conformadas (Galvanizado, Galvalume, Alumínio e Pré-pintados).\n\n" +
      "Seu papel é auxiliar o CALHEIRO PROFISSIONAL, FUNILEIRO e CLIENTES deles de forma precisa, prática e em tom amigável.\n" +
      "Você domina cálculos de peso teórico de chapas e bobinas. Lembre-se das seguintes densidades volumétricas comumente usadas no mercado:\n" +
      "- Aço Galvanizado e Pré-pintado: ~7.85 g/cm³ (7850 kg/m³). Fórmula de peso: Espessura(mm) * Largura Comercial(m) * Comprimento(m) * 7.85.\n" +
      "- Aço Galvalume: ~7.80 g/cm³ (7800 kg/m³). Fórmula de peso: Espessura(mm) * Largura Comercial(m) * Comprimento(m) * 7.80.\n" +
      "- Alumínio: ~2.70 g/cm³ (2700 kg/m³). Fórmula de peso: Espessura(mm) * Largura Comercial(m) * Comprimento(m) * 2.70.\n\n" +
      "Ajude com dimensionamento de queda d'água (inclinação recomendada para telha trapezoidal é de no mínimo 10% sem emendas, e recomendado 15% para sanduíche), " +
      "comparativos de resistência (como Galvalume durando até 4x mais do que galvanizado simples contra maresia, ou Alumínio sendo imune à ferrugem), " +
      "cálculo de desenvolvimento ou fitas slitas (como fracionar bobinas de 1200mm de largura para menor desperdício: ex: 4 fitas de 30cm, ou 3 de 40cm), " +
      "e converta as bitolas MSG para milímetros (MSG 28 = 0.43mm, MSG 26 = 0.50mm, MSG 24 = 0.65mm, MSG 22 = 0.80mm).\n\n" +
      "Responda formatando com tabelas limpas do markdown ou listas com marcadores elegantes, sempre em Português do Brasil.";

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
