import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Faq } from "@/types";
import { cn } from "@/lib/utils";

type FaqItemProps = {
  faq: Faq;
};

export default function FaqItem({ faq }: FaqItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-100 shadow-sm hover:shadow rounded-lg mb-5 overflow-hidden transition-all duration-200">
      <div 
        className="p-5 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-800 pr-4">{faq.question}</h3>
        <ChevronDown 
          className={cn("min-w-5 w-5 h-5 text-blue-500 transition-transform", 
            isExpanded && "transform rotate-180"
          )}
        />
      </div>
      <div 
        className={cn(
          "px-5 overflow-hidden transition-all duration-300 ease-in-out", 
          isExpanded 
            ? "max-h-[800px] opacity-100 pb-5" 
            : "max-h-0 opacity-0 pb-0"
        )}
      >
        <div className="text-gray-600 border-t border-gray-100 pt-4">{faq.answer}</div>
      </div>
    </div>
  );
}
