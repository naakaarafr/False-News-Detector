import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationVerdict = "True" | "False" | "Partially True" | "Inconclusive";

export interface VerificationSource {
  url: string;
  snippet: string;
  title?: string;
}

export interface VerificationResultData {
  verdict: VerificationVerdict;
  explanation: string;
  sources: VerificationSource[];
  confidence?: "high" | "medium" | "low";
}

interface VerificationResultProps {
  result: VerificationResultData;
  originalQuery: string;
}

const getVerdictConfig = (verdict: VerificationVerdict) => {
  switch (verdict) {
    case "True":
      return {
        color: "bg-verified-true text-verified-true-foreground",
        icon: CheckCircle,
        bgClass: "bg-verified-true/10 border-verified-true/20"
      };
    case "False":
      return {
        color: "bg-verified-false text-verified-false-foreground",
        icon: XCircle,
        bgClass: "bg-verified-false/10 border-verified-false/20"
      };
    case "Partially True":
      return {
        color: "bg-verified-partial text-verified-partial-foreground",
        icon: AlertCircle,
        bgClass: "bg-verified-partial/10 border-verified-partial/20"
      };
    case "Inconclusive":
      return {
        color: "bg-verified-inconclusive text-verified-inconclusive-foreground",
        icon: HelpCircle,
        bgClass: "bg-verified-inconclusive/10 border-verified-inconclusive/20"
      };
  }
};

export const VerificationResult = ({ result, originalQuery }: VerificationResultProps) => {
  const config = getVerdictConfig(result.verdict);
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-[var(--shadow-medium)]">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-muted-foreground">
              Verification Result
            </CardTitle>
            {result.confidence && (
              <Badge variant="outline" className="text-xs">
                {result.confidence} confidence
              </Badge>
            )}
          </div>
          
          <div className={cn("p-4 rounded-lg border-2", config.bgClass)}>
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-current" />
              <div>
                <Badge className={cn("text-lg font-bold px-4 py-2", config.color)}>
                  {result.verdict}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Original Query */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Verified Content:
          </h4>
          <p className="text-sm italic">"{originalQuery}"</p>
        </div>

        {/* Explanation */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Analysis</h3>
          <p className="text-foreground leading-relaxed">{result.explanation}</p>
        </div>

        {/* Sources */}
        {result.sources.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-4">
              Sources ({result.sources.length})
            </h3>
            <div className="space-y-3">
              {result.sources.map((source, index) => (
                <Card key={index} className="border-l-4 border-l-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {source.title && (
                          <h4 className="font-medium text-sm">{source.title}</h4>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {source.snippet}
                        </p>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Source
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Results are based on searches of credible sources and fact-checking sites.
          Always verify important information through multiple sources.
        </div>
      </CardContent>
    </Card>
  );
};