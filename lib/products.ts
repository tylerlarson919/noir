export type Product = {
  id: string;
  supplierLink: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: "men" | "women" | "accessories";
  subCategory:
    | "pants"
    | "shirts"
    | "hoodies"
    | "shoes"
    | "jackets"
    | "accessories"
    | string;
  sizes: ("XS" | "S" | "M" | "L" | "XL" | "XXL")[];
  images: string[];
  sizeChart: string;
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
  Red: { name: "Red", hex: "#953b32" },
};

export const products: Product[] = [
  {
    id: "1",
    supplierLink: "https://www.aliexpress.us/item/3256805892595424.html",
    sku: "3256805892595424",
    name: "Fleece Zippered Hoodie",
    description:
      "Essential cotton t-shirt with a relaxed fit and crew neckline.",
    price: 34.99,
    category: "men",
    subCategory: "hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005654/16_izekrm.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005654/15_ymfk5c.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/2_wndeby.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005646/3_sdsp4v.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005650/8_u3ypjs.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005648/7_h04jck.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005647/6_jtghf0.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005647/4_bi1qe2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005647/5_jfg3od.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005651/10_k3thfn.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/12_rwte0w.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Black",
        hex: "#17161b",
        images: [0, 1, 2],
      },
      {
        name: "Grey",
        hex: "#cac8c6",
        images: [3],
      },
      {
        name: "Green",
        hex: "#527267",
        images: [4, 5, 6, 7],
      },
      {
        name: "Navy Blue",
        hex: "#514d67",
        images: [8],
      },
      {
        name: "Red",
        hex: "#953b32",
        images: [9, 10, 11, 12],
      },
    ],
    featured: true,
  },
];

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getNewProducts(): Product[] {
  return products.filter((product) => product.new);
}
export function getProductsBySubCategory(
  subCategory: Product["subCategory"],
): Product[] {
  return products.filter((product) => product.subCategory === subCategory);
}

export function getProductsByCategory(
  category: Product["category"],
): Product[] {
  return products.filter((product) => product.category === category);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
