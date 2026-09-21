import ReactMarkdown from "react-markdown";
import { Link } from "wouter";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={className} data-testid="article-content">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href && href.startsWith("/")) {
              const hash = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#") + 1) : "";
              return (
                <Link
                  href={hash ? href.slice(0, href.indexOf("#")) || "/" : href}
                  onClick={
                    hash
                      ? () => {
                          setTimeout(() => {
                            document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      : undefined
                  }
                >
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
