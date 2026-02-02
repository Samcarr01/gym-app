'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  suggestions: string[];
  onSearch: (query: string) => string[];
  onChange?: (value: string) => void;
  value?: string;
  maxSuggestions?: number;
}

export function Autocomplete({
  suggestions: _,
  onSearch,
  onChange,
  value = '',
  maxSuggestions = 6,
  className,
  ...props
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update internal value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    if (newValue.length >= 2) {
      const results = onSearch(newValue).slice(0, maxSuggestions);
      setFilteredSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [onChange, onSearch, maxSuggestions]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSelectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedIndex, handleSelectSuggestion]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue.length >= 2) {
            const results = onSearch(inputValue).slice(0, maxSuggestions);
            if (results.length > 0) {
              setFilteredSuggestions(results);
              setShowSuggestions(true);
            }
          }
        }}
        className={className}
        autoComplete="off"
        {...props}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                'px-3 py-2 cursor-pointer text-sm transition-colors',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
