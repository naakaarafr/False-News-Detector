import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RecentVerification {
  id: string;
  query_text: string;
  verdict: string;
  explanation: string;
  sources: Array<{
    url: string;
    snippet: string;
    title?: string;
  }>;
  created_at: string;
}

const getVerdictColor = (verdict: string) => {
  switch (verdict.toLowerCase()) {
    case "true":
      return "bg-verified-true text-verified-true-foreground";
    case "false":
      return "bg-verified-false text-verified-false-foreground";
    case "partially true":
    case "inconclusive":
      return "bg-verified-partial text-verified-partial-foreground";
    default:
      return "bg-verified-inconclusive text-verified-inconclusive-foreground";
  }
};

export const RecentVerifications = () => {
  const [recentVerifications, setRecentVerifications] = useState<RecentVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecentVerifications();
  }, []);

  const fetchRecentVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent verifications:', error);
        return;
      }

      // Type cast the sources field properly
      const typedData = (data || []).map(item => ({
        ...item,
        sources: Array.isArray(item.sources) ? item.sources : []
      })) as RecentVerification[];
      
      setRecentVerifications(typedData);
    } catch (error) {
      console.error('Error fetching recent verifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recent Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentVerifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recent Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No recent verifications found. Submit your first fact-check above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Recent Verifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentVerifications.map((verification) => (
            <Collapsible key={verification.id}>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      "{verification.query_text}"
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        className={cn("text-xs", getVerdictColor(verification.verdict))}
                      >
                        {verification.verdict}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(verification.created_at)}
                      </span>
                    </div>
                  </div>
                  <CollapsibleTrigger 
                    onClick={() => toggleItem(verification.id)}
                    className="shrink-0"
                  >
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        openItems.has(verification.id) ? "rotate-180" : ""
                      )}
                    />
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-3">
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Explanation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {verification.explanation}
                    </p>
                  </div>
                  
                  {verification.sources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sources</h4>
                      <div className="space-y-2">
                        {verification.sources.map((source, index) => (
                          <div key={index} className="text-xs">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                            >
                              {source.title || source.url}
                            </a>
                            {source.snippet && (
                              <p className="text-muted-foreground mt-1">
                                {source.snippet}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};