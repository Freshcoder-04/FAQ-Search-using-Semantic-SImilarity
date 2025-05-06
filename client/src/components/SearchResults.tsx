import FaqItem from "./FaqItem";
import { Faq } from "@/types";

type SearchResultsProps = {
  results: Faq[];
};

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Search Results
      </h2>
      
      {results.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-100 shadow-sm">
          <p className="text-gray-600">No FAQs found matching your search. Please try different keywords.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((result, index) => (
            <FaqItem key={index} faq={result} />
          ))}
        </div>
      )}
    </div>
  );
}
