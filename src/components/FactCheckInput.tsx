import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FactCheckInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const FactCheckInput = ({ onSubmit, isLoading }: FactCheckInputProps) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText.trim());
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-[var(--shadow-medium)]">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Verify News Content
              </h2>
            </div>
            <p className="text-muted-foreground">
              Paste a news headline or article text to check its accuracy against reliable sources
            </p>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter news headline or article text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] resize-none text-base"
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>
                We'll search credible sources like fact-checking sites and reputable news outlets
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!inputText.trim() || isLoading}
            className={cn(
              "w-full bg-[var(--gradient-hero)] hover:opacity-90 transition-opacity",
              "shadow-[var(--shadow-soft)] text-lg font-medium py-6"
            )}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Verify News
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};