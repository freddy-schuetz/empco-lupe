import * as React from "react";
import { RefreshCw, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageScanResult } from "@/lib/types";

interface Props {
  scan: PageScanResult | null;
  busy: boolean;
  onScan: () => void;
}

function statusIcon(status?: string) {
  const cls = "h-4 w-4";
  if (status === "block") return <ShieldX className={cls + " text-[hsl(var(--sev-high))]"} />;
  if (status === "warn") return <ShieldAlert className={cls + " text-[hsl(var(--sev-med))]"} />;
  return <ShieldCheck className={cls + " text-[hsl(var(--sev-clean))]"} />;
}

function statusLabel(status?: string) {
  if (status === "block") return "BLOCK";
  if (status === "warn") return "WARN";
  if (status === "clean") return "UNAUFFÄLLIG";
  return "noch nicht gescannt";
}

function statusBadgeVariant(status?: string): "high" | "med" | "clean" | "secondary" {
  if (status === "block") return "high";
  if (status === "warn") return "med";
  if (status === "clean") return "clean";
  return "secondary";
}

export const StatusBar: React.FC<Props> = ({ scan, busy, onScan }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {statusIcon(scan?.status)}
            <span className="truncate" title={scan?.page_domain}>{scan?.page_domain || "Keine Seite gescannt"}</span>
          </div>
          {scan?.page_title && (
            <h2 className="mt-1 truncate text-sm font-semibold leading-snug" title={scan.page_title}>
              {scan.page_title}
            </h2>
          )}
        </div>
        <Button onClick={onScan} disabled={busy} size="sm" className="shrink-0">
          <RefreshCw className={"h-3 w-3 " + (busy ? "animate-spin" : "")} />
          {busy ? "Prüfe..." : (scan ? "Erneut" : "Prüfen")}
        </Button>
      </div>

      {scan && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold leading-none">{scan.page_score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <Badge variant={statusBadgeVariant(scan.status)}>{statusLabel(scan.status)}</Badge>
            <div className="ml-auto text-right text-[10px] text-muted-foreground">
              <div>{scan.sections_checked} geprüfte Sections</div>
              <div>{scan.sections_scanned} insgesamt</div>
            </div>
          </div>
          <Separator />
        </>
      )}
    </div>
  );
};
