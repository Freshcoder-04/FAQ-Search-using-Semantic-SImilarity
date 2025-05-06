import FaqItem from "./FaqItem";
import { Faq } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type FaqListProps = {
  faqs: Faq[] | undefined;
  isLoading: boolean;
  error: string | null;
};

export default function FaqList({ faqs, isLoading, error }: FaqListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        Frequently Asked Questions
      </h2>
      
      {isLoading && (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && faqs?.length === 0 && (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-100">
          <p className="text-gray-600">No FAQs available for the selected language.</p>
        </div>
      )}
      
      {!isLoading && !error && faqs && faqs.length > 0 && (
        <div>
          {faqs.map((faq, index) => (
            <FaqItem key={index} faq={faq} />
          ))}
        </div>
      )}
    </div>
  );
}
