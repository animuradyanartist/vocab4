import React from "react";

/** Supported native-language codes your app will use to learn English with */
export type SupportedLanguageCode = "hy" | "ru" | "it";

/** Human-readable options for the dropdown */
export const LANGUAGE_OPTIONS: { code: SupportedLanguageCode; label: string }[] = [
  { code: "hy", label: "Armenian" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
];

/** Helper to show the label for a code (you can import this in Settings) */
export const languageLabel = (code: SupportedLanguageCode) =>
  LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? "Armenian";

type Props = {
  /** Current selected language code (e.g., "hy") */
  value: SupportedLanguageCode;
  /** Called when user selects a new language */
  onChange: (newCode: SupportedLanguageCode) => void;
  /** Optional label text shown above the select */
  label?: string;
  /** Optional id for accessibility / testing */
  id?: string;
  /** If true, HTML `required` attribute is set */
  required?: boolean;
  /** Optional extra class names for styling */
  className?: string;
};

export default function LanguageSelect({
  value,
  onChange,
  label = "Choose your language",
  id = "native-language",
  required = false,
  className = "",
}: Props) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value as SupportedLanguageCode)}
        className="border rounded-md p-2"
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
