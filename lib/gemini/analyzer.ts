import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function analyzeInvoiceDocument(fileBase64: string, mimeType: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analiza esta factura de compra/invoice de paquete importado. 
Extrae la siguiente información en formato JSON estricto:
{
  "tracking_usa": "número de rastreo de la tienda o courier USA si aparece",
  "invoice_number": "número de factura/invoice de la compra",
  "descripcion_mercancia": "breve descripción del producto comprado",
  "peso_kg": 0.0,
  "valor_usd": 0.00
}
Si algún valor no es visible, retorna cadena vacía o 0. Solo devuelve el objeto JSON sin formato markdown extra.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      }
    ]
  });

  const text = response.text || '{}';
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}
