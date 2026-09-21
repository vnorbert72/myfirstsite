import { ExternalLink, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface Reference {
  title: string;
  source: string;
  url: string;
}

interface ReferencesProps {
  references: Reference[];
  className?: string;
}

export function References({ references, className }: ReferencesProps) {
  const { t } = useTranslation();

  if (references.length === 0) return null;

  return (
    <div
      className={`p-4 border rounded-lg bg-muted/30 space-y-3 ${className ?? ""}`}
      data-testid="references-section"
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">
          {t("references.title", { defaultValue: "Scientific References" })}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("references.description", {
          defaultValue:
            "Calculations and recommendations are based on peer-reviewed research and guidelines from the following authoritative sources:",
        })}
      </p>
      <ul className="space-y-2 text-xs">
        {references.map((ref, idx) => (
          <li key={idx} className="flex gap-2" data-testid={`reference-${idx}`}>
            <span className="text-muted-foreground shrink-0">[{idx + 1}]</span>
            <div className="flex-1 min-w-0">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-primary hover:underline inline-flex items-start gap-1"
              >
                <span>{ref.title}</span>
                <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
              </a>
              <div className="text-muted-foreground">{ref.source}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
