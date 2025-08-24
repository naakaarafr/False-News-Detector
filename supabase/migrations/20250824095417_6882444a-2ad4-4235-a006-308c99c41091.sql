-- Enable Row Level Security on verifications table
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verifications (fact-checks should be transparent and publicly accessible)
CREATE POLICY "Anyone can view verifications" 
ON public.verifications 
FOR SELECT 
USING (true);

-- Allow the service role to insert new verifications (used by edge functions)
CREATE POLICY "Service role can insert verifications" 
ON public.verifications 
FOR INSERT 
WITH CHECK (true);