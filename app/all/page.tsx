'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { products, Product } from '@/lib/products';
import FilterMenu from '@/components/FilterMenu';


const XIcon = () => {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 ml-2">
          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
  );
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = searchParams.get('category') as Product['category'] | null;

  // Initialize active filters from URL parameters
  const initialFilters = {
    category: searchParams.getAll('category'),
    subCategory: searchParams.getAll('subCategory'),
    colors: searchParams.getAll('colors'),
    sizes: searchParams.getAll('sizes')
  };
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Read all filter parameters from URL
    const categoryParams = searchParams.getAll('category');
    const subCategoryParams = searchParams.getAll('subCategory');
    const colorsParams = searchParams.getAll('colors');
    const sizesParams = searchParams.getAll('sizes');
    
    // Handle 'type' parameter from header menu (map it to appropriate filter)
    const typeParam = searchParams.get('type');
    if (typeParam) {
      // Check if type parameter maps to a category or subcategory
      if (['men', 'women', 'accessories'].includes(typeParam)) {
        if (!categoryParams.includes(typeParam)) {
          categoryParams.push(typeParam);
        }
      } else {
        if (!subCategoryParams.includes(typeParam)) {
          subCategoryParams.push(typeParam);
        }
      }
    }
    
    // Update active filters from URL params
    setActiveFilters({
      category: categoryParams,
      subCategory: subCategoryParams,
      colors: colorsParams,
      sizes: sizesParams
    });
    
  }, [searchParams]);

  // Update filters and then apply them
  useEffect(() => {
    applyFilters();
    // Update URL based on active filters
    updateURL();
  }, [activeFilters]);

  const updateURL = () => {
    // Build the URL search params based on active filters
    const params = new URLSearchParams();
    
    activeFilters.category.forEach(category => {
      params.append('category', category);
    });
    
    activeFilters.subCategory.forEach(subCategory => {
      params.append('subCategory', subCategory);
    });
    
    activeFilters.colors.forEach(color => {
      params.append('colors', color);
    });
    
    activeFilters.sizes.forEach(size => {
      params.append('sizes', size);
    });
    
    // Update the URL without refreshing the page
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleFilter = (type: string, value: string) => {
    setActiveFilters(prev => {
      const key = type as keyof typeof prev;
      const currentFilters = [...prev[key]];
      
      if (currentFilters.includes(value)) {
        // Remove filter
        return {
          ...prev,
          [key]: currentFilters.filter(item => item !== value)
        };
      } else {
        // Add filter
        return {
          ...prev,
          [key]: [...currentFilters, value]
        };
      }
    });
  };
  
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply category filters
    if (activeFilters.category.length > 0) {
      filtered = filtered.filter(product => 
        activeFilters.category.includes(product.category)
      );
    }
    
    // Apply subCategory filters
    if (activeFilters.subCategory.length > 0) {
      filtered = filtered.filter(product => 
        activeFilters.subCategory.includes(product.subCategory)
      );
    }
    
    // Apply color filters
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors.some(color => activeFilters.colors.includes(color.name))
      );
    }
    
    // Apply size filters
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes.some(size => activeFilters.sizes.includes(size))
      );
    }
    
    setFilteredProducts(filtered);
  };

  
  const openFilterMenu = () => {
    setIsFilterMenuOpen(prevState => !prevState);
  };

  const filterButton = (type: string, filter: string) => {
    const isActive = activeFilters[type as keyof typeof activeFilters].includes(filter);
    
    return (
      <button 
        key={`${type}-${filter}`}
        onClick={() => toggleFilter(type, filter)}
        className={`tracking-wider px-4 py-2 text-sm border border-1 rounded flex flex-row items-center capitalize ${
          isActive ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 
                    'border-black/60 dark:border-textaccent/60'
        }`}
      >
        {filter}
        <XIcon/>
      </button>
    );
  };
  
  // Get all active filter values for display
  const allActiveFilters = [
    ...activeFilters.category,
    ...activeFilters.subCategory,
    ...activeFilters.colors,
    ...activeFilters.sizes
  ];
  
  return (
    <div className="container mx-auto px-4 pb-14 flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-4">Shop Collection</h1>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={openFilterMenu}
          className={`tracking-wider px-4 py-2 text-sm border border-1 rounded ${
            isFilterMenuOpen ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 
              'border-black/60 dark:border-textaccent/60'
          }`}
        >
          All Filters
        </button>

        {/* Display active filters with option to remove */}
        {allActiveFilters.map(filter => {
          let filterType = '';
          if (activeFilters.category.includes(filter)) filterType = 'category';
          else if (activeFilters.subCategory.includes(filter)) filterType = 'subCategory';
          else if (activeFilters.colors.includes(filter)) filterType = 'colors';
          else if (activeFilters.sizes.includes(filter)) filterType = 'sizes';
          
          return filterButton(filterType, filter);
        })}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      <FilterMenu
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        onFilterChange={toggleFilter}
        activeFilters={activeFilters}
        numberOfResults={filteredProducts.length}
      />
    </div>
  );
}