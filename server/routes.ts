import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getFaqsByLanguage, searchFaqs } from "./faqService";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get FAQs by language
  app.get("/api/faqs/:language", async (req, res) => {
    try {
      const language = req.params.language;
      const supportedLanguages = ["en", "de", "es", "fr", "it"];
      
      if (!supportedLanguages.includes(language)) {
        return res.status(400).json({ 
          message: `Invalid language. Supported languages are: ${supportedLanguages.join(", ")}` 
        });
      }
      
      const faqs = await getFaqsByLanguage(language);
      return res.json(faqs);
    } catch (error) {
      console.error("Error getting FAQs:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve FAQs. Please try again later." 
      });
    }
  });

  // API route to search FAQs
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      const language = req.query.language as string;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const supportedLanguages = ["en", "de", "es", "fr", "it"];
      if (!language || !supportedLanguages.includes(language)) {
        return res.status(400).json({ 
          message: `Invalid language. Supported languages are: ${supportedLanguages.join(", ")}` 
        });
      }
      
      const results = await searchFaqs(query, language);
      return res.json(results);
    } catch (error) {
      console.error("Error searching FAQs:", error);
      return res.status(500).json({ 
        message: "Failed to search FAQs. Please try again later." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
