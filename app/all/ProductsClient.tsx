// /all/ProductsClient.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/lib/products";
import FilterMenu from "@/components/FilterMenu";

/* local icon helper */
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
  export default function ProductsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
  
    // Initialize active filters from URL parameters
    const initialFilters = useMemo(
      () => ({
        category: searchParams.getAll("category"),
        subCategory: searchParams.getAll("subCategory"),
        colors: searchParams.getAll("colors"),
        sizes: searchParams.getAll("sizes"),
      }),
      [searchParams],  
    );
  
    const [activeFilters, setActiveFilters] = useState(initialFilters);
    // ---------- list derived from filters ----------
    const filteredProducts = useMemo(() => {
      let filtered = [...products];

      // category (with ‘featured’ support)
      if (activeFilters.category.length) {
        const hasFeatured = activeFilters.category.includes("featured");
        const regular = activeFilters.category.filter((c) => c !== "featured");

        filtered = filtered.filter(
          (p) =>
            (hasFeatured && p.featured) ||
            (regular.length && regular.includes(p.category)),
        );
      }

      // sub-category
      if (activeFilters.subCategory.length) {
        filtered = filtered.filter((p) =>
          activeFilters.subCategory.includes(p.subCategory),
        );
      }

      // colors
      if (activeFilters.colors.length) {
        filtered = filtered.filter((p) =>
          p.colors.some((c) => activeFilters.colors.includes(c.name)),
        );
      }

      // sizes
      if (activeFilters.sizes.length) {
        filtered = filtered.filter((p) =>
          p.sizes.some((s) => activeFilters.sizes.includes(s)),
        );
      }

      return filtered;
    }, [activeFilters]);

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
  

  
    /* ---------- debounced URL sync ---------- */
const debouncedReplace = useMemo(
  () => debounce((url: string) => router.replace(url, { scroll: false }), 300),
  [router],
);

const updateURL = useCallback(() => {
  const params = new URLSearchParams();
  activeFilters.category.forEach((c) => params.append("category", c));
  activeFilters.subCategory.forEach((s) => params.append("subCategory", s));
  activeFilters.colors.forEach((c) => params.append("colors", c));
  activeFilters.sizes.forEach((s) => params.append("sizes", s));

  const newUrl = `${pathname}?${params.toString()}`;
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  if (newUrl !== currentUrl) debouncedReplace(newUrl);
}, [activeFilters, pathname, searchParams, debouncedReplace]);

useEffect(() => updateURL(), [updateURL]);
useEffect(() => () => debouncedReplace.cancel(), [debouncedReplace]);
  
    const toggleFilter = useCallback((type: string, value: string) => {
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
    }, [activeFilters]);

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
      <div className="relative flex flex-col justify-start items-center pb-14">
        <div className="flex flex-col w-full h-full items-start justify-center gap-8 stagger-fadein overflow-y-hidden">
          <div
            className="w-full h-full flex flex-col items-start justify-end p-8"
            style={{
              backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745184139/TAFT_WEB_CollectionBanner_Mens-Lowtop_kkpuaq.webp')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "325px",
            }}
          >
            <h1 className="text-white font-normal tracking-wide text-4xl">
              Shop All
            </h1>
            <p className="text-white font-light tracking-wide text-lg">
              Shop the latest collection.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 ml-4">
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
          <div className="px-2 w-full">
            <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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