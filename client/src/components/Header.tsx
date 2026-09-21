import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.calculators"), path: "/#calculators", isAnchor: true },
    { label: t("nav.blog"), path: "/blog" },
    { label: t("nav.tips"), path: "/tips" },
    { label: t("nav.supplements"), path: "/supplements" },
    { label: t("nav.foodSearch"), path: "/food" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2" data-testid="link-home-logo">
            <img
              src="/images/logo-148.webp"
              srcSet="/images/logo-148.webp 148w, /images/logo-256.webp 256w"
              sizes="74px"
              alt="FIT-FUSION CALCULATE - Your Movement"
              className="h-10 sm:h-12 w-auto object-contain"
              width="74"
              height="48"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.isAnchor ? (
                <a key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </a>
              ) : (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path || (item.path === "/blog" && location.startsWith("/blog")) || (item.path === "/tips" && location === "/tips") || (item.path === "/supplements" && location === "/supplements") ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-1">
            {navItems.map((item) => (
              item.isAnchor ? (
                <a key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </a>
              ) : (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path || (item.path === "/blog" && location.startsWith("/blog")) || (item.path === "/tips" && location === "/tips") || (item.path === "/supplements" && location === "/supplements") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
