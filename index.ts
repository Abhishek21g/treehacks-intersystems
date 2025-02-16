
import { serve } from "https://deno.land/std@0.204.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, format } = await req.json()
    console.log('Generating summary:', { format })

    let prompt = "Summarize the following research paper:\n\n"
    if (format === "abstract") {
      prompt += "Provide a concise abstract-style summary."
    } else if (format === "full") {
      prompt += "Provide a detailed one-page summary covering key points."
    } else if (format === "flowchart") {
      prompt += "Create a text-based flowchart showing the main concepts and their relationships."
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ],
      }),
    })

    const data = await response.json()
    const summary = data.choices[0].message.content

    return new Response(JSON.stringify({ summary }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in generate-summary:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})
