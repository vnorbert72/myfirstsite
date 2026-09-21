import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubscriberSchema, type InsertSubscriber } from "@shared/schema";
import { Loader2, Mail, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface SubscribeResponse {
  ok: boolean;
}

export function Newsletter() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertSubscriber>({
    resolver: zodResolver(insertSubscriberSchema),
    defaultValues: { email: "", language: i18n.language || "en" },
  });

  const mutation = useMutation({
    mutationFn: async (values: InsertSubscriber) => {
      const res = await apiRequest("POST", "/api/subscribe", values);
      return (await res.json()) as SubscribeResponse;
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset({ email: "", language: i18n.language || "en" });
      toast({
        title: t("newsletter.successTitle"),
        description: t("newsletter.successDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("newsletter.errorTitle"),
        description: t("newsletter.errorDescription"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertSubscriber) => {
    mutation.mutate({ ...values, language: i18n.language || "en" });
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-t bg-gradient-to-br from-primary/10 via-background to-chart-2/10"
      data-testid="section-newsletter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            <div className="md:col-span-2 bg-primary/10 p-6 sm:p-8 flex flex-col justify-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/20 text-primary">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2
                id="newsletter-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                data-testid="text-newsletter-title"
              >
                {t("newsletter.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("newsletter.subtitle")}
              </p>
            </div>

            <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center gap-4">
              <div aria-live="polite" className="contents">
                {submitted && (
                  <div
                    className="flex items-start gap-3 rounded-md bg-chart-2/10 border border-chart-2/30 p-4"
                    data-testid="status-newsletter-success"
                    role="status"
                  >
                    <CheckCircle2 className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold">{t("newsletter.thankYouTitle")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("newsletter.thankYouDescription")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {!submitted && (
                <>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      noValidate
                      className="flex flex-col sm:flex-row gap-3"
                      data-testid="form-newsletter"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <label htmlFor="newsletter-email" className="sr-only">
                              {t("newsletter.emailLabel")}
                            </label>
                            <FormControl>
                              <Input
                                {...field}
                                id="newsletter-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder={t("newsletter.placeholder")}
                                aria-label={t("newsletter.emailLabel")}
                                disabled={mutation.isPending}
                                data-testid="input-newsletter-email"
                              />
                            </FormControl>
                            <FormMessage data-testid="text-newsletter-error" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={mutation.isPending}
                        data-testid="button-newsletter-subscribe"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t("newsletter.subscribing")}</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>{t("newsletter.subscribe")}</span>
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-xs text-muted-foreground">
                    {t("newsletter.privacy")}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
