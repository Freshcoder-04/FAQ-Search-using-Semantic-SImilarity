// server/faqService.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import axios from "axios";
import { Faq } from "@/types";

// ——— define __dirname in ESM context ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// simple in-memory cache
const faqCache: Record<string, Faq[]> = {};

const PYTHON_URL = "http://localhost:8000";
const PYTHON_SEARCH = "/search";

/**
 * Read FAQs from the CSV file for a specific language.
 */
export async function getFaqsByLanguage(language: string): Promise<Faq[]> {
  if (faqCache[language]) return faqCache[language];

  const faqs: Faq[] = [];
  const fileName = `mfaq_${language}.csv`;
  const filePath = path.join(__dirname, "data", fileName);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`FAQ CSV not found: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: Record<string, string>) => {
        if (row.question && row.answer) {
          faqs.push({
            question: row.question,
            answer:   row.answer
          });
        }
      })
      .on("end", () => {
        faqCache[language] = faqs;
        resolve(faqs);
      })
      .on("error", (err) => reject(err));
  });
}

/**
 * Query the Python service for the top-k FAQs.
 */
export async function searchFaqs(
  query: string,
  language: string,
  top_k: number = 10
): Promise<Faq[]> {
  try {
    const resp = await axios.post(
      PYTHON_URL + PYTHON_SEARCH,
      { query, lang: language, top_k },
      { headers: { "Content-Type": "application/json" } }
    );

    // Python now returns { results: [ { question, answer, cross_score, cosine_score, … }, … ] }
    const { results } = resp.data;
    if (!Array.isArray(results)) {
      console.error("Unexpected /search response shape:", resp.data);
      return [];
    }

    // map into our Faq type (and carry over score if you like)
    return results.map((r: any) => ({
      question: r.question,
      answer: r.answer,
      score: r.cross_score,   // optional field on Faq
    }));
  } catch (err) {
    console.error("Error querying Python semantic engine:", err);
    return [];
  }
}
