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

    // Perform new verification (mock implementation for now)
    console.log('Performing new verification analysis')
    
    // TODO: Integrate with Gemini Flash 2.0 and web search APIs
    // For now, return a more realistic mock response
    const mockResult: VerificationResult = {
      verdict: Math.random() > 0.5 ? "Inconclusive" : "Partially True",
      explanation: `Analysis of "${query_text}" requires integration with web search APIs and AI analysis services. This mock response demonstrates the caching system - subsequent identical queries within 7 days will return this cached result instead of performing new searches.`,
      sources: [
        {
          url: "https://www.snopes.com",
          snippet: "Fact-checking website for verification of claims and urban legends",
          title: "Snopes - Fact Checking"
        },
        {
          url: "https://www.factcheck.org",
          snippet: "Nonpartisan, nonprofit consumer advocate for voters",
          title: "FactCheck.org"
        },
        {
          url: "https://www.politifact.com",
          snippet: "Fact-checking journalism from the Poynter Institute",
          title: "PolitiFact"
        }
      ]
    }

    // Store the new verification result
    const { error: insertError } = await supabase
      .from('verifications')
      .insert({
        query_text: query_text.trim(),
        verdict: mockResult.verdict,
        explanation: mockResult.explanation,
        sources: mockResult.sources
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      // Still return the result even if we can't cache it
    } else {
      console.log('Verification result cached successfully')
    }

    return new Response(
      JSON.stringify({
        ...mockResult,
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