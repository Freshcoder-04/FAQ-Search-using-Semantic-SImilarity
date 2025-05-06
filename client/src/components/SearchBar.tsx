import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  isSearching: boolean;
};

export default function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-blue-500" />
        </div>
        <Input
          type="text"
          placeholder="Search FAQs..."
          className="pl-10 pr-3 py-2 border border-gray-200 bg-white focus:ring-blue-500 focus:border-blue-500 h-12 rounded-lg shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
      </div>
      <Button 
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium h-12 min-w-[120px] rounded-lg shadow-sm transition-all duration-200"
        disabled={isSearching || !searchQuery.trim()}
      >
        {isSearching ? (
          <div className="flex items-center justify-center">
            <span>Searching</span>
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span>Search</span>
          </div>
        )}
      </Button>
    </form>
  );
}
