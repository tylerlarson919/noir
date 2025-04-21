"use client";
import { Product, COLORS } from '@/lib/products';
import React, { useRef, useState, useEffect } from 'react';

type FilterMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (type: string, value: string) => void;
  activeFilters: {
    category: string[];
    subCategory: string[];
    colors: string[];
    sizes: string[];
  };
  numberOfResults: number;
};

const XIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 ml-2">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
    );
}; 

export default function FilterMenu({ isOpen, onClose, onFilterChange, activeFilters, numberOfResults  }: FilterMenuProps) {
  const categories = ['featured', 'men', 'women', 'accessories'];
  const subCategories = ['pants', 'shirts', 'hoodies', 'shoes', 'jackets', 'accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const menuRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };
  
  if (!isOpen) return null;

  const FilterSection = ({ title, items, type }: { title: string, items: string[], type: string }) => (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const isActive = activeFilters[type as keyof typeof activeFilters].includes(item);
          return (
            <button
              key={item}
              onClick={() => onFilterChange(type, item)}
              className={`flex items-center px-3 py-1 text-sm rounded ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 text-gray-800 dark:bg-darkaccent3 dark:text-gray-200'
              }`}
            >
              {item}
              {isActive && <XIcon/>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ColorFilterSection = () => (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-semibold">Colors</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(COLORS).map(([key, color]) => {
          const isActive = activeFilters.colors.includes(color.name);
          return (
            <button
              key={key}
              onClick={() => onFilterChange('colors', color.name)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border ${
                isActive ? 'border-black dark:border-textaccent' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isActive && <span className="text-white">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 flex justify-start z-[100] bg-black transition-opacity duration-300 ease-in-out ${
        isVisible ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        ref={menuRef} 
        className={`relative p-6 w-full h-full overflow-y-auto transition-all duration-300 bg-white dark:bg-darkaccent max-w-md ${
            isClosing ? 'drawer-animation-exit' : 'drawer-animation'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Filters</h2>
          <button onClick={handleClose} className="transition-colors duration-300 dark:text-textaccent hover:text-black dark:hover:text-white button-grow text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <FilterSection title="Categories" items={categories} type="category" />
        <FilterSection title="Product Type" items={subCategories} type="subCategory" />
        <ColorFilterSection />
        <FilterSection title="Sizes" items={sizes} type="sizes" />

        <div className="absolute flex items-center justify-end gap-4 bottom-6 right-6 left-6">
          <button
            onClick={() => {
              // Clear all filters
              Object.keys(activeFilters).forEach(key => {
                activeFilters[key as keyof typeof activeFilters].forEach(value => {
                  onFilterChange(key, value);
                });
              });
            }}
            className="px-4 py-2 rounded-md border dark:border-gray-600 border-textaccent"
          >
            Clear All
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md dark:bg-white dark:text-black text-white bg-black"
          >
            Show {numberOfResults} results
          </button>
        </div>
      </div>
    </div>
  );
}