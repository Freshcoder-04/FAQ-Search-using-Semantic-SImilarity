import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import LanguageSelector from "@/components/LanguageSelector";
import FaqList from "@/components/FaqList";
import SearchResults from "@/components/SearchResults";
import { Faq, Language } from "@/types";
import { useFaqData } from "@/hooks/useFaqData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [searchResults, setSearchResults] = useState<Faq[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { faqs, isLoading: isFaqsLoading, error: faqsError } = useFaqData(currentLanguage);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    setSearchResults(null); // Clear search results when changing language
    setError(null);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&language=${currentLanguage}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search FAQs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-5 sm:p-8">
        <header className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Multilingual FAQ Search
            </h1>
            <p className="text-gray-600 mb-6">Search for answers in multiple languages</p>
            
            {/* Language selector in a separate row */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Language
              </label>
              <div className="w-full sm:w-48">
                <LanguageSelector 
                  currentLanguage={currentLanguage} 
                  onLanguageChange={handleLanguageChange} 
                />
              </div>
            </div>
          </div>
          
          <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6 border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {searchResults ? (
            <SearchResults results={searchResults} />
          ) : (
            <FaqList faqs={faqs} isLoading={isFaqsLoading} error={faqsError} />
          )}
        </div>
      </div>
    </div>
  );
}
