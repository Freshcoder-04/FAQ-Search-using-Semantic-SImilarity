import { useQuery } from "@tanstack/react-query";
import { Faq, Language } from "@/types";

export function useFaqData(language: Language) {
  const { data: faqs, isLoading, error } = useQuery<Faq[]>({
    queryKey: [`/api/faqs/${language}`],
    enabled: !!language,
  });

  return {
    faqs,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load FAQs") : null,
  };
}
