import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSettings } from "@/lib/types";

interface Props {
  settings: UserSettings;
  onChange: (next: Partial<UserSettings>) => void;
  currentDomain: string;
}

const SECTORS: Array<{ value: UserSettings["sector"]; label: string }> = [
  { value: "auto", label: "Automatisch" },
  { value: "hospitality", label: "Hotel / Gastgewerbe" },
  { value: "dmo", label: "DMO" },
  { value: "tour_operator", label: "Reiseveranstalter" },
];

export const SettingsPanel: React.FC<Props> = ({ settings, onChange, currentDomain }) => {
  const inSkipList = settings.skip_domains.includes(currentDomain);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Sprache</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(["de", "en"] as const).map((l) => (
            <label key={l} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="radio"
                name="lang"
                value={l}
                checked={settings.language === l}
                onChange={() => onChange({ language: l })}
              />
              {l === "de" ? "Deutsch" : "English"}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Sektor-Hinweis</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {SECTORS.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="radio"
                name="sector"
                value={s.value}
                checked={settings.sector === s.value}
                onChange={() => onChange({ sector: s.value })}
              />
              {s.label}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Auto-Hervorhebung</CardTitle></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.auto_highlight}
              onChange={(e) => onChange({ auto_highlight: e.target.checked })}
            />
            Triggerwörter automatisch markieren (offline, keine API-Calls)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Diese Domain ignorieren</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">{currentDomain || "(keine Seite offen)"}</p>
          <Button
            variant={inSkipList ? "secondary" : "outline"}
            size="sm"
            disabled={!currentDomain}
            onClick={() => {
              const next = inSkipList
                ? settings.skip_domains.filter((d) => d !== currentDomain)
                : [...settings.skip_domains, currentDomain];
              onChange({ skip_domains: next });
            }}
          >
            {inSkipList ? "Wieder aktivieren" : "Zur Skip-Liste hinzufügen"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Telemetrie</CardTitle></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start gap-2 text-xs">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={settings.telemetry_opt_in}
              onChange={(e) => onChange({ telemetry_opt_in: e.target.checked })}
            />
            <span>
              Anonyme Nutzungsdaten teilen (Anzahl geprüfter Sections, Verteilung Severities, page_url_hash). Klartext-URLs niemals.
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
};
