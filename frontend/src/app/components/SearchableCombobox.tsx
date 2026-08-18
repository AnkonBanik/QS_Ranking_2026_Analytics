"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, Loader2, Check } from "lucide-react";

export interface ComboboxOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string; // Currently selected option label or ID
  onChange: (selectedOption: ComboboxOption) => void;
  placeholder?: string;
  label?: string;
  accentColor?: "indigo" | "emerald" | "amber";
}

export default function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  accentColor = "indigo",
}: SearchableComboboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Debounce logic (200ms)
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. High-performance filtering across label and sublabel
  const filteredOptions = useMemo(() => {
    if (!debouncedSearch.trim()) return options.slice(0, 100); // Limit rendered DOM items for max speed
    const query = debouncedSearch.toLowerCase().trim();
    return options
      .filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
      )
      .slice(0, 100);
  }, [options, debouncedSearch]);

  // Reset focus index when results change
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredOptions]);

  // 3. Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Keyboard Navigation Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSearchTerm("");
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // 5. Highlight matched text substring logic
  const renderHighlightedText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400/30 text-amber-600 dark:text-amber-300 font-extrabold rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  // Color theme mapping
  const badgeClasses = {
    indigo: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    emerald: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    amber: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  }[accentColor];

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-sub">{label}</span>
          {value && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeClasses} truncate max-w-[160px]`}>
              {value}
            </span>
          )}
        </div>
      )}

      {/* Input Field Box */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-sub absolute left-3 top-3 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          placeholder={value || placeholder}
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full custom-input rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-2.5 top-2.5 flex items-center">
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-sub animate-spin" />
          ) : searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearch("");
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-md text-sub hover:text-main transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl glass-card border border-gray-200 dark:border-gray-800 shadow-2xl p-1 space-y-0.5 custom-scrollbar"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.label === value || opt.id === value;
              const isFocused = idx === focusedIndex;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isFocused ? "bg-indigo-600 text-white font-bold" : isSelected ? "custom-pill font-extrabold" : "text-main hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="truncate font-semibold">
                      {renderHighlightedText(opt.label, debouncedSearch)}
                    </div>
                    {opt.sublabel && (
                      <div className={`text-[10px] truncate ${isFocused ? "text-indigo-200" : "text-sub"}`}>
                        {renderHighlightedText(opt.sublabel, debouncedSearch)}
                      </div>
                    )}
                  </div>

                  {isSelected && <Check className={`w-3.5 h-3.5 ${isFocused ? "text-white" : "text-indigo-500"}`} />}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-sub">
              No results found for "<span className="font-bold text-main">{debouncedSearch}</span>"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
