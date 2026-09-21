import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PdfExportButtonProps {
  targetId: string;
  filename?: string;
  className?: string;
}

export function PdfExportButton({
  targetId,
  filename = "fitfusion-result.pdf",
  className,
}: PdfExportButtonProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      console.warn(`PdfExportButton: element with id "${targetId}" not found`);
      return;
    }

    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .from(element)
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          // The shipped Html2PdfOptions type is missing `pagebreak`, which the
          // library supports at runtime — hence the cast.
          ...({ pagebreak: { mode: ["avoid-all", "css", "legacy"] } } as object),
        })
        .save();
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={exporting}
      className={className}
      data-testid="button-export-pdf"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {t("common.downloadPdf", { defaultValue: "Download PDF" })}
    </Button>
  );
}
