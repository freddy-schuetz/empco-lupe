import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  onAccept: () => void;
}

export const ConsentScreen: React.FC<Props> = ({ onAccept }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold">EmpCo-Lupe Datenschutzhinweis</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Was wird an die Prüf-API gesendet?</CardTitle>
          <CardDescription>Transparenz vor dem ersten Check.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed">
          <p>
            Wenn du eine Seite oder einen markierten Text prüfen lässt, sendet die Extension nur den jeweiligen Textabschnitt
            zusammen mit einem Section-Hinweis (z.B. <code>hero_headline</code>) und einem SHA-256-Hash der Seiten-URL an
            den n8n-Workflow von Friedemann Schütz (<strong>n8n.friedemann-schuetz.de</strong>).
          </p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>Klartext-URLs werden nicht übertragen.</li>
            <li>Account-Daten, Cookies oder personenbezogene Daten werden nicht übertragen.</li>
            <li>Datenverarbeiter: OpenAI (LLM), Voyage AI (Embeddings), Cohere (Reranking). Hosting auf eigenem Server in DE.</li>
            <li>Die History bleibt lokal in deinem Browser (chrome.storage.local).</li>
            <li>Telemetrie ist standardmäßig AUS.</li>
          </ul>
          <p>
            Mit „Verstanden" stimmst du zu, dass markierte Texte für den EmpCo-Check zur API gesendet werden. Auto-Hervorhebung
            läuft komplett offline und sendet nichts.
          </p>
        </CardContent>
      </Card>
      <Button onClick={onAccept} className="w-full">
        Verstanden &mdash; Schnellcheck starten
      </Button>
      <p className="px-1 text-[10px] text-muted-foreground/80">
        Side-Project von <a href="https://friedemann-schuetz.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Friedemann Schütz</a> &mdash; AI Automation Expert &amp; n8n Ambassador. Brauchst du sowas auch? <a href="mailto:f.schuetz@posteo.de" className="text-primary hover:underline">f.schuetz@posteo.de</a>
      </p>
    </div>
  );
};
