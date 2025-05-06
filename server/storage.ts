import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import { Faq } from "@/types";

// Export the storage interface for use in routes
export const storage = {
  /**
   * Get FAQs from CSV file for a specific language
   */
  async getFaqsByLanguage(language: string): Promise<Faq[]> {
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
      return records.map((record: any) => ({
        question: record.question || record.Question || "",
        answer: record.answer || record.Answer || ""
      }));
    } catch (error) {
      console.error(`Error reading FAQ file for language ${language}:`, error);
      return [];
    }
  }
};
