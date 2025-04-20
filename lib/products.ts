export type Product = {
  id: string;
  supplierLink: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: 'men' | 'women' | 'accessories';
  subCategory: 'pants' | 'shirts' | 'hoodies' | 'shoes' | 'jackets'  | 'accessories' | string;
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  images: string[];
  modelImages: string[];
  colors: {
    name: string;
    hex: string;
    images: number[]; // Product image index of the image for this color
  }[];
  featured?: boolean;
  new?: boolean;
};

  export const COLORS = {
    Black: { name: "Black", hex: "#17161b" },
    Grey: { name: "Grey", hex: "#cac8c6" },
    Green: { name: "Green", hex: "#527267" },
    "Navy Blue": { name: "Navy Blue", hex: "#514d67" },
    Red: { name: "Red", hex: "#953b32" }
  };
  
  export const products: Product[] = [
    {
      id: "1",
      supplierLink: "https://www.aliexpress.us/item/3256805892595424.html",
      sku: "3256805892595424",
      name: "Fleece Zippered Hoodie",
      description: "Essential cotton t-shirt with a relaxed fit and crew neckline.",
      price: 34.99,
      category: "men",
      subCategory: "hoodies",
      sizes: ["S", "M", "L", "XL", "XXL"],
      images: ["https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png", "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/2_wndeby.png", "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005646/3_sdsp4v.png", "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005647/4_bi1qe2.png", "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005647/5_jfg3od.png"],
      modelImages: ["https://res.cloudinary.com/dyujm1mtq/image/upload/fl_preserve_transparency/v1745005647/6_jtghf0.jpg?_s=public-apps", "https://res.cloudinary.com/dyujm1mtq/image/upload/fl_preserve_transparency/v1745005652/12_rwte0w.jpg?_s=public-apps", "https://res.cloudinary.com/dyujm1mtq/image/upload/fl_preserve_transparency/v1745005652/13_lxx8xq.jpg?_s=public-apps", "https://res.cloudinary.com/dyujm1mtq/image/upload/fl_preserve_transparency/v1745005654/16_izekrm.jpg?_s=public-apps"],
      colors:
      [
        { 
          name: "Black", 
          hex: "#17161b",
          images: [0, 1],
        },
        { 
          name: "Grey", 
          hex: "#cac8c6",
          images: [2, 3],
        },
        { 
          name: "Green", 
          hex: "#527267",
          images: [4,], 
        },
        { 
          name: "Navy Blue", 
          hex: "#514d67",
          images: [4,],
        },
        { 
          name: "Red", 
          hex: "#953b32",
          images: [4,], 
        },
      ],
      featured: true
    },
  ];
  
  export function getFeaturedProducts(): Product[] {
    return products.filter(product => product.featured);
  }
  
  
  export function getNewProducts(): Product[] {
    return products.filter(product => product.new);
  }
  export function getProductsBySubCategory(subCategory: Product['subCategory']): Product[] {
    return products.filter(product => product.subCategory === subCategory);
  }
  
  export function getProductsByCategory(category: Product['category']): Product[] {
    return products.filter(product => product.category === category);
  }
  
  export function getProductById(id: string): Product | undefined {
    return products.find(product => product.id === id);
  }