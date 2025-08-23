import { useState } from "react";
import { Shield, AlertTriangle, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactCheckInput } from "@/components/FactCheckInput";
import { VerificationResult, VerificationResultData } from "@/components/VerificationResult";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);
  const { toast } = useToast();

  const handleFactCheck = async (text: string) => {
    setIsLoading(true);
    setCurrentQuery(text);
    setVerificationResult(null);
    
    try {
      // This is a mock implementation - real functionality requires Supabase integration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock result for demonstration
      const mockResult: VerificationResultData = {
        verdict: "Inconclusive",
        explanation: "To properly verify this news content, we need to integrate with web search APIs and AI analysis services. This requires backend functionality through Supabase integration.",
        sources: [
          {
            url: "https://docs.lovable.dev/integrations/supabase/",
            snippet: "Connect your Lovable project to Supabase to enable backend functionality including AI API integration, web search capabilities, and data storage.",
            title: "Supabase Integration Documentation"
          }
        ],
        confidence: "medium"
      };
      
      setVerificationResult(mockResult);
      
      toast({
        title: "Demo Mode",
        description: "Connect Supabase to enable real fact-checking functionality",
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify the news content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                False News Detector
              </h1>
            </div>
            <Badge variant="outline" className="ml-auto">
              AI-Powered Verification
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Verify News with
              <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">
                {" "}AI-Powered Analysis
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cross-reference news content against credible sources and fact-checking sites 
              to determine accuracy and reliability.
            </p>
          </div>

          {/* Features */}
          {!verificationResult && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Web Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Searches credible sources and fact-checking sites
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI cross-verification and analysis
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Reliable Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Evidence-based conclusions with source citations
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Input Form */}
          <FactCheckInput onSubmit={handleFactCheck} isLoading={isLoading} />

          {/* Results */}
          {verificationResult && (
            <div className="mt-8">
              <VerificationResult 
                result={verificationResult} 
                originalQuery={currentQuery}
              />
            </div>
          )}

          {/* Backend Integration Notice */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Backend Integration Required</h3>
              <p className="text-muted-foreground mb-4">
                To enable real fact-checking functionality, you need to connect this app to Supabase 
                for AI API integration, web search capabilities, and data storage.
              </p>
              <Badge variant="outline">Click the green Supabase button to get started</Badge>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Built with Lovable AI • Always verify important information through multiple sources
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;