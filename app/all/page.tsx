"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { products, Product } from "@/lib/products";
import FilterMenu from "@/components/FilterMenu";

const XIcon = () => {
  return (
    <svg
      className="size-4 ml-2"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
        fillRule="evenodd"
      />
    </svg>
  );
};
function ProductsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize active filters from URL parameters
    const initialFilters = {
      category: searchParams.getAll("category"),
      subCategory: searchParams.getAll("subCategory"),
      colors: searchParams.getAll("colors"),
      sizes: searchParams.getAll("sizes"),
    };

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [activeFilters, setActiveFilters] = useState(initialFilters);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

    useEffect(() => {
      // Read all filter parameters from URL
      const categoryParams = searchParams.getAll("category");
      const subCategoryParams = searchParams.getAll("subCategory");
      const colorsParams = searchParams.getAll("colors");
      const sizesParams = searchParams.getAll("sizes");

      // Handle 'type' parameter from header menu (map it to appropriate filter)
      const typeParam = searchParams.get("type");

      if (typeParam) {
        // Check if type parameter maps to a category or subcategory
        if (["men", "women", "accessories"].includes(typeParam)) {
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
        sizes: sizesParams,
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
  
      activeFilters.category.forEach((category) => {
        params.append("category", category);
      });
  
      activeFilters.subCategory.forEach((subCategory) => {
        params.append("subCategory", subCategory);
      });
  
      activeFilters.colors.forEach((color) => {
        params.append("colors", color);
      });
  
      activeFilters.sizes.forEach((size) => {
        params.append("sizes", size);
      });
  
      const newUrl = `${pathname}?${params.toString()}`;
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      
      // Only update if the URL actually changed
      if (newUrl !== currentUrl) {
        // Use replace instead of push to avoid adding to browser history
        router.replace(newUrl, { scroll: false });
      }
    };

    const toggleFilter = (type: string, value: string) => {
      setActiveFilters((prev) => {
        const key = type as keyof typeof prev;
        const currentFilters = [...prev[key]];

        if (currentFilters.includes(value)) {
          // Remove filter
          return {
            ...prev,
            [key]: currentFilters.filter((item) => item !== value),
          };
        } else {
          // Add filter
          return {
            ...prev,
            [key]: [...currentFilters, value],
          };
        }
      });
    };

    const applyFilters = () => {
      let filtered = [...products];

      // Apply category filters with special handling for 'featured'
      if (activeFilters.category.length > 0) {
        filtered = filtered.filter((product) => {
          // Check if 'featured' is one of the active category filters
          const hasFeatured = activeFilters.category.includes("featured");
          // Get the regular categories (excluding 'featured')
          const regularCategories = activeFilters.category.filter(
            (cat) => cat !== "featured",
          );

          // If 'featured' is selected and product is featured, or if product's category matches any other selected category
          return (
            (hasFeatured && product.featured) ||
            (regularCategories.length > 0 &&
              regularCategories.includes(product.category))
          );
        });
      }

      // Apply subCategory filters
      if (activeFilters.subCategory.length > 0) {
        filtered = filtered.filter((product) =>
          activeFilters.subCategory.includes(product.subCategory),
        );
      }

      // Apply color filters
      if (activeFilters.colors.length > 0) {
        filtered = filtered.filter((product) =>
          product.colors.some((color) =>
            activeFilters.colors.includes(color.name),
          ),
        );
      }

      // Apply size filters
      if (activeFilters.sizes.length > 0) {
        filtered = filtered.filter((product) =>
          product.sizes.some((size) => activeFilters.sizes.includes(size)),
        );
      }

      setFilteredProducts(filtered);
    };

    const openFilterMenu = () => {
      setIsFilterMenuOpen((prevState) => !prevState);
    };

    const filterButton = (type: string, filter: string) => {
      const isActive =
        activeFilters[type as keyof typeof activeFilters].includes(filter);

      return (
        <button
          key={`${type}-${filter}`}
          className={`tracking-wider px-4 py-2 text-sm border border-1 rounded flex flex-row items-center capitalize ${
            isActive
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/30 dark:border-textaccent/30"
          }`}
          onClick={() => toggleFilter(type, filter)}
        >
          {filter}
          <XIcon />
        </button>
      );
    };

    // Get all active filter values for display
    const allActiveFilters = [
      ...activeFilters.category,
      ...activeFilters.subCategory,
      ...activeFilters.colors,
      ...activeFilters.sizes,
    ];

    return (
      <div className="mx-4 relative flex flex-col justify-start items-center">
        <div className="flex flex-col w-full h-full items-start justify-center mt-28 gap-8">
          <div
            className="w-full h-full flex flex-col items-start justify-end p-8"
            style={{
              backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745184139/TAFT_WEB_CollectionBanner_Mens-Lowtop_kkpuaq.webp')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "300px",
            }}
          >
            <h1 className="text-white font-normal tracking-wide text-4xl">
              Shop All
            </h1>
            <p className="text-white font-light tracking-wide text-lg">
              Shop the latest collection.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`tracking-wider px-4 py-2 text-sm border border-1 rounded ${
                isFilterMenuOpen
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/30 dark:border-textaccent/30"
              }`}
              onClick={openFilterMenu}
            >
              Filter
            </button>

            {/* Display active filters with option to remove */}
            {allActiveFilters.map((filter) => {
              let filterType = "";

              if (activeFilters.category.includes(filter))
                filterType = "category";
              else if (activeFilters.subCategory.includes(filter))
                filterType = "subCategory";
              else if (activeFilters.colors.includes(filter))
                filterType = "colors";
              else if (activeFilters.sizes.includes(filter)) filterType = "sizes";

              return filterButton(filterType, filter);
            })}
          </div>

          <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          )}

          <FilterMenu
            activeFilters={activeFilters}
            isOpen={isFilterMenuOpen}
            numberOfResults={filteredProducts.length}
            onClose={() => setIsFilterMenuOpen(false)}
            onFilterChange={toggleFilter}
          />
        </div>
      </div>
    );
}
  export default function ProductsPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsPageContent />
      </Suspense>
    );
  }
