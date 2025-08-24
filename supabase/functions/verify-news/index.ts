import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VerificationRequest {
  query_text: string
}

interface VerificationResult {
  verdict: string
  explanation: string
  sources: Array<{
    url: string
    snippet: string
    title?: string
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query_text }: VerificationRequest = await req.json()

    if (!query_text || query_text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Verifying news:', query_text)

    // Check for existing verification within the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: existingVerification, error: queryError } = await supabase
      .from('verifications')
      .select('*')
      .ilike('query_text', query_text.trim())
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('Database query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to query database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return cached result if found
    if (existingVerification && existingVerification.length > 0) {
      console.log('Returning cached verification result')
      const cached = existingVerification[0]
      return new Response(
        JSON.stringify({
          verdict: cached.verdict,
          explanation: cached.explanation,
          sources: cached.sources,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Perform web search and AI analysis
    console.log('Performing web search and AI analysis')
    
    const serperApiKey = Deno.env.get('SERPER_API_KEY')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!serperApiKey || !geminiApiKey) {
      throw new Error('Missing required API keys: SERPER_API_KEY and GEMINI_API_KEY')
    }

    // Step 1: Search for information about the query
    const searchResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query_text,
        num: 5
      })
    })

    if (!searchResponse.ok) {
      throw new Error('Failed to perform web search')
    }

    const searchData = await searchResponse.json()
    const sources = (searchData.organic || []).slice(0, 3).map((result: any) => ({
      url: result.link,
      title: result.title,
      snippet: result.snippet
    }))

    // Step 2: Analyze the search results with AI
    const searchContext = sources.map(source => 
      `Title: ${source.title}\nURL: ${source.url}\nContent: ${source.snippet}`
    ).join('\n\n')

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a fact-checking expert. Analyze claims and provide verdicts based on available evidence. 

Your verdict must be one of: "True", "False", "Partially True", or "Inconclusive"

Provide a clear explanation of your analysis and reasoning. Be objective and cite the evidence you're using.

Please fact-check this claim: "${query_text}"

Here is the search context I found:
${searchContext}

Based on this information, what is your verdict and explanation?`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3
        }
      })
    })

    if (!aiResponse.ok) {
      throw new Error('Failed to get AI analysis')
    }

    const aiData = await aiResponse.json()
    const aiAnalysis = aiData.candidates[0].content.parts[0].text

    // Extract verdict from AI response (basic parsing)
    let verdict = "Inconclusive"
    const lowerAnalysis = aiAnalysis.toLowerCase()
    if (lowerAnalysis.includes('verdict: true') || lowerAnalysis.includes('verdict is true')) {
      verdict = "True"
    } else if (lowerAnalysis.includes('verdict: false') || lowerAnalysis.includes('verdict is false')) {
      verdict = "False"
    } else if (lowerAnalysis.includes('verdict: partially true') || lowerAnalysis.includes('partially true')) {
      verdict = "Partially True"
    }

    const result: VerificationResult = {
      verdict,
      explanation: aiAnalysis,
      sources
    }

    // Store the new verification result
    const { error: insertError } = await supabase
      .from('verifications')
      .insert({
        query_text: query_text.trim(),
        verdict: result.verdict,
        explanation: result.explanation,
        sources: result.sources
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Still return the result even if we can't cache it
    } else {
      console.log('Verification result cached successfully')
    }

    return new Response(
      JSON.stringify({
        ...result,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing verification:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process verification request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})