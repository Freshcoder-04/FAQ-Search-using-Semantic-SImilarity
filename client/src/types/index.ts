export type Language = "en" | "de" | "es" | "fr" | "it" | "nl" | "pl" | "pt" | "ru";

export interface Faq {
  question: string;
  answer: string;
  score?: number; 
}
