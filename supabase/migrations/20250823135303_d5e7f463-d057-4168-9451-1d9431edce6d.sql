-- Create verifications table for storing fact-check results
CREATE TABLE public.verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    query_text TEXT NOT NULL,
    verdict TEXT NOT NULL,
    explanation TEXT NOT NULL,
    sources JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by query_text and created_at
CREATE INDEX idx_verifications_query_text ON public.verifications (LOWER(query_text));
CREATE INDEX idx_verifications_created_at ON public.verifications (created_at DESC);

-- Disable Row Level Security for anonymous access
ALTER TABLE public.verifications DISABLE ROW LEVEL SECURITY;