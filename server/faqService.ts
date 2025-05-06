import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import { Faq } from "@/types";
import { executePythonSearch } from "./pythonSearch";

// Cache FAQs by language to avoid reading files repeatedly
const faqCache: Record<string, Faq[]> = {};

/**
 * Read FAQs from a CSV file for a specific language
 */
export async function getFaqsByLanguage(language: string): Promise<Faq[]> {
  // Return from cache if available
  if (faqCache[language]) {
    return faqCache[language];
  }

  try {
    const filePath = path.join(process.cwd(), `data/mfaq_${language}.csv`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Map CSV records to FAQ objects
    const faqs = records.map((record: any) => ({
      question: record.question || record.Question || "",
      answer: record.answer || record.Answer || ""
    }));
    
    // Cache the results
    faqCache[language] = faqs;
    
    return faqs;
  } catch (error) {
    console.error(`Error reading FAQ file for language ${language}:`, error);
    
    // Return empty array if file doesn't exist or has errors
    return [];
  }
}

/**
 * Search FAQs using Python pipeline
 */
export async function searchFaqs(query: string, language: string): Promise<Faq[]> {
  try {
    // Execute Python search pipeline and get results
    const searchResults = await executePythonSearch(query, language);
    
    return searchResults;
  } catch (error) {
    console.error("Error executing search:", error);
    throw error;
  }
}
