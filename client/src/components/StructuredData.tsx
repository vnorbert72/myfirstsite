import { useEffect, useId } from "react";

interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const reactId = useId();

  useEffect(() => {
    const elementId = `jsonld-${reactId.replace(/:/g, "")}`;
    let script = document.getElementById(elementId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = elementId;
      document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);

    return () => {
      const existing = document.getElementById(elementId);
      if (existing) existing.remove();
    };
  }, [data, reactId]);

  return null;
}
