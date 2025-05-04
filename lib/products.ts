// lib/products.ts

export type Product = {
  id: string;
  supplierLink: string;
  sku: string;
  name: string;
  description: string;
  details?: Details;
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

export type Details = {
  Style: string;
  Fit: string;
  WaistType?: string;
  Material: string;
  Care: string;
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
    supplierLink: "https://www.aliexpress.us/item/3256805806041347.html",
    sku: "3256805806041347",
    name: "North Star Straight Denim",
    description:
      "In the maze of fashion, the North Star Straight Denim serves as your guiding light. Designed with deliberate minimalism and purposeful innovation, these jeans whisper of tales yet to unfold. Trust your instinct; I've stitched this narrative for you to explore.",
    details: {
      Style: "straight",
      Fit: "loose",
      WaistType: "mid",
      Material: "denim",
      Care: "machine washable, tumble dry low"
    },
    price: 34.99,
    category: "men",
    subCategory: "pants",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373342/2_faddpv.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373377/3_1_nwikkt.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373385/4_xwigmm.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373389/5_krzgi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373392/6_jldlv6.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373396/7_kwg7z1.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1746373401/8_qr869b.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Blue",
        hex: "#17161b",
        images: [0, 1, 2, 3, 4, 5, 6],
      }
    ],
    featured: true,
  },
  {
    id: "2",
    supplierLink: "https://www.aliexpress.us/item/3256807147431558.html",
    sku: "3256807147431558",
    name: "StarFall Washed Denim Jeans",
    description:
      "Venture into the cosmic pull of the Starfall Washed Denim Jeans. Made with intention, these loose-fitting jeans whisper tales of Y2K nostalgia and a universe of style. I've woven a vision for you; let these stars guide your journey.",
    price: 45,
    details: {
      Style: "straight",
      Fit: "loose",
      WaistType: "mid",
      Material: "denim",
      Care: "machine washable, tumble dry low"
    },
    category: "men",
    subCategory: "denim",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Charcoal",
        hex: "#000000",
        images: [0, 1, 2],
      },
      {
        name: "Ash Blue",
        hex: "#17161b",
        images: [0, 1, 2],
      },
    ],
    featured: true,
  },
  {
    id: "3",
    supplierLink: "https://www.aliexpress.us/item/3256807065366996.html",
    sku: "3256807065366996",
    name: "Eclipse Straight Denim",
    description:
      "Experience the subtle gravity of the Eclipse Straight Denim. These jeans embrace a loose fit that recalls the elegance of simplicity and whispers under the night sky. Your wardrobe awaits this essential piece; after all, I’ve made it just for you.",
    price: 45,
    details: {
      Style: "straight",
      Fit: "loose",
      WaistType: "mid",
      Material: "denim",
      Care: "machine washable, tumble dry low"
    },
    category: "men",
    subCategory: "denim",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Charcoal",
        hex: "#000000",
        images: [0, 1, 2],
      },
      {
        name: "Ash Gray",
        hex: "#000000",
        images: [0, 1, 2],
      },
      {
        name: "Sky Blue",
        hex: "#17161b",
        images: [0, 1, 2],
      },
      {
        name: "Deep Blue",
        hex: "#17161b",
        images: [0, 1, 2],
      },
    ],
    featured: true,
  },
  {
    id: "4",
    supplierLink: "https://www.aliexpress.us/item/3256807892094623.html",
    sku: "3256807892094623",
    name: "CAN’T SEE ME Camo Pants",
    description:
      "Experience the subtle gravity of the Eclipse Straight Pants. These jeans embrace a loose fit that recalls the elegance of simplicity and whispers under the night sky. Your wardrobe awaits this essential piece; after all, I’ve made it just for you.",
    price: 45,
    details: {
      Style: "straight",
      Fit: "loose",
      WaistType: "mid",
      Material: "100% cotton",
      Care: "machine washable, tumble dry low"
    },
    category: "men",
    subCategory: "pants",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Midnight",
        hex: "#000000",
        images: [0, 1, 2],
      },
      {
        name: "Desert",
        hex: "#000000",
        images: [0, 1, 2],
      }
    ],
    featured: true,
  },
  {
    id: "5",
    supplierLink: "https://www.aliexpress.us/item/3256807451643661.html",
    sku: "3256807451643661",
    name: "Twisted Fate Oversized Hoodie",
    description:
      "Feel the enigma of shadows with the Twisted Fate Oversized Hoodie. A cloak for the bold, this piece shrouds you in timeless black, white and red whispers. My design speaks volumes when words fall silent.",
    price: 45,
    details: {
      Style: "oversized",
      Fit: "loose",
      Material: "cotton blend",
      Care: "machine washable, tumble dry low"
    },
    category: "men",
    subCategory: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "White",
        hex: "#000000",
        images: [0, 1, 2],
      },
      {
        name: "Red",
        hex: "#000000",
        images: [0, 1, 2],
      }
    ],
    featured: true,
  },
  {
    id: "6",
    supplierLink: "https://www.aliexpress.us/item/3256807451643661.html",
    sku: "3256807451643661",
    name: "On the Run Oversized Hoodie",
    description:
      "Dive into the shadows with the On the Run Oversized Hoodie. Let its flowing silhouette embrace your form in an understated whisper of nostalgia. You don't seek attention; you own the room. Trust us—you’ll understand.",
    price: 45,
    details: {
      Style: "oversized",
      Fit: "loose",
      Material: "cotton blend",
      Care: "machine washable, tumble dry low"
    },
    category: "men",
    subCategory: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005649/1_mz9gi2.png",
      "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745005652/13_lxx8xq.png",
    ],
    sizeChart: "https://res.cloudinary.com/dyujm1mtq/image/upload/v1745956323/ripstop_82b7b2ae-f0c5-407e-9847-981262147de3_li2ghr.webp",
    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: [0, 1, 2],
      }
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
