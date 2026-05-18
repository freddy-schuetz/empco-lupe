import * as React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryEntry } from "@/lib/types";

interface Props {
  entries: HistoryEntry[];
  onClear: () => void;
}

function statusVariant(s: HistoryEntry["status"]): "high" | "med" | "clean" {
  return s === "block" ? "high" : s === "warn" ? "med" : "clean";
}

function formatTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "";
  }
}

export const HistoryList: React.FC<Props> = ({ entries, onClear }) => {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">Noch keine gespeicherten Checks. Letzte 50 Domains werden hier sichtbar.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{entries.length} Eintraege</p>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2 text-xs">
          <Trash2 className="h-3 w-3" />
          Leeren
        </Button>
      </div>
      {entries.map((e) => (
        <Card key={e.page_url_hash + e.scanned_at} className="overflow-hidden">
          <CardContent className="space-y-1 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={statusVariant(e.status)}>{e.status.toUpperCase()}</Badge>
              <span className="text-xs font-semibold">{e.page_score}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{formatTs(e.scanned_at)}</span>
            </div>
            <p className="truncate text-xs text-foreground" title={e.page_title}>{e.page_title || "(ohne Titel)"}</p>
            <p className="truncate text-[10px] text-muted-foreground" title={e.page_domain}>{e.page_domain}</p>
            <div className="flex gap-1.5 pt-1">
              {e.counts.high > 0 && <Badge variant="high">{e.counts.high} H</Badge>}
              {e.counts.med > 0 && <Badge variant="med">{e.counts.med} M</Badge>}
              {e.counts.low > 0 && <Badge variant="low">{e.counts.low} L</Badge>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
