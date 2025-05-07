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
          <p className="text-gray-600">
            No FAQs found matching your search. Please try different keywords.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {results.map((faq, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* Your existing FaqItem will render question & answer */}
                <FaqItem faq={faq} />

                {/* If you’ve added a `score` field to Faq, show it */}
                {faq.score != null && (
                  <p className="mt-2 text-sm text-gray-500">
                    Score: {faq.score.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
