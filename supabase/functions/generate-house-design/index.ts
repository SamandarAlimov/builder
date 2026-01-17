import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, designParams } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (type === "chat") {
      // Chat mode - AI helps user describe their dream house
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Siz professional uy dizayneri va arxitektorisiz. Foydalanuvchiga o'zining orzu qilgan uyini tasvirlashda yordam berasiz.
              
Savollar bering:
- Uy turi (hovli, ko'p qavatli, villa, zamonaviy)
- Xonalar soni va tuzilishi
- Stil (zamonaviy, klassik, minimalist, an'anaviy O'zbek)
- Ranglar va materiallar
- Hovli va tashqi ko'rinish

Qisqa, aniq javoblar bering. O'zbek tilida gaplashing. Har bir javobda foydalanuvchini keyingi qadam sari yo'naltiring.`
            },
            ...message
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Juda ko'p so'rov. Biroz kuting va qayta urinib ko'ring." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI xizmati uchun to'lov talab qilinadi." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("AI Gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "Xatolik yuz berdi";
      
      return new Response(
        JSON.stringify({ content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } else if (type === "generate_image") {
      // Image generation mode
      const { buildingType, style, roomsCount, floorsCount, colorScheme, userDescription } = designParams;
      
      const prompt = `Realistic architectural visualization of a ${buildingType || 'house'}, ${floorsCount || 2} floors, ${roomsCount || 4} rooms.
Style: ${style || 'modern'}.
Color scheme: ${colorScheme || 'neutral warm tones'}.
${userDescription ? `Additional details: ${userDescription}` : ''}
Professional exterior view, daylight, landscaped garden, photorealistic, architectural photography style, 4K quality.`;

      console.log("Generating image with prompt:", prompt);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Juda ko'p so'rov. Biroz kuting va qayta urinib ko'ring." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI xizmati uchun to'lov talab qilinadi." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("Image generation failed");
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const textContent = data.choices?.[0]?.message?.content || "";
      
      if (!imageUrl) {
        throw new Error("No image generated");
      }

      return new Response(
        JSON.stringify({ imageUrl, description: textContent, promptUsed: prompt }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-house-design:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});