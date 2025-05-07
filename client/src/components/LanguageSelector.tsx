import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Language } from "@/types";

type LanguageSelectorProps = {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
};

type LanguageOption = {
  value: Language;
  label: string;
};

const languageOptions: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portugese" },
  { value: "ru", label: "Russian" },
];

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <Select 
      value={currentLanguage} 
      onValueChange={(value) => onLanguageChange(value as Language)}
    >
      <SelectTrigger className="w-full bg-white border border-gray-200 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-md z-50">
        {languageOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value} 
            className="cursor-pointer hover:bg-blue-50"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
