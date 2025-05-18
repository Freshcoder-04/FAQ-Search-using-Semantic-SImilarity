// server/faqService.ts
import axios from "axios";
import { Faq } from "@/types";

const faqCache: Record<string, Faq[]> = {};

/**
 * Read FAQs from a CSV file for a specific language
 * (used to populate an initial list or allow browsing)
 */
export async function getFaqsByLanguage(language: string): Promise<Faq[]> {
  if (faqCache[language]) return faqCache[language];

  // adjust the path if needed—your CSVs live in server/data
  const filePath = `./server/data/mfaq_${language}.csv`;

  // you already have parsing logic here, so leave it as is
  // ...
  // (your existing CSV-parsing code)
  // ...

  // after parsing:
  faqCache[language] = faqs;
  return faqs;
}

/**
 * Search FAQs via your Express → FastAPI pipeline
 */
export async function searchFaqs(
  query: string,
  language: string
): Promise<Faq[]> {
  try {
    // hit your own API route, which proxies to Python
    const resp = await axios.post("http://localhost:8000/search", {
      query,
      lang: language,
    });

    // the FastAPI service returns a single best match;
    // wrap it in an array so your UI code can always map over results
    const { question, answer, cross_score, cosine_score } = resp.data;
    return [
      {
        question,
        answer,
        // if you want to show scores in the UI:
        // score: cross_score,
      },
    ];
  } catch (e) {
    console.error("Error searching FAQs:", e);
    return [];
  }
}
