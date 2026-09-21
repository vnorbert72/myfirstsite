import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";

interface AuthorBioProps {
  authorName: string;
}

export function AuthorBio({ authorName }: AuthorBioProps) {
  const { t } = useTranslation();

  const initials = authorName
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="p-6 mb-8" data-testid="card-author-bio">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
        <Avatar className="h-20 w-20 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold" data-testid="text-author-initials">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{t("authorBio.label", { defaultValue: "About the Author" })}</span>
          </div>
          <h3 className="text-lg font-semibold" data-testid="text-author-name">
            {authorName}
          </h3>
          <p className="text-sm text-muted-foreground font-medium" data-testid="text-author-credentials">
            {t("authorBio.credentials", {
              defaultValue: "Certified Fitness & Nutrition Specialist",
            })}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-author-bio">
            {t("authorBio.bio", {
              defaultValue:
                "Our content team includes certified personal trainers, registered dietitians, and sports nutrition specialists committed to delivering accurate, science-backed health and fitness guidance.",
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}
