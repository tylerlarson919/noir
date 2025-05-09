// src/context/CartContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: { name: string; hex: string; images: number[] };
  image: string;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, slug: string, size: string, color: string) => void;
  updateQuantity: (
    id: string,
    slug: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Update localStorage and totals when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const price = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    setTotalItems(itemCount);
    setTotalPrice(price);
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists with same id, size and color
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.slug === newItem.slug &&
          item.size === newItem.size &&
          item.color.name === newItem.color.name,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];

        updatedItems[existingItemIndex].quantity += newItem.quantity;

        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, newItem];
      }
    });

    // Open cart modal when adding item
    setIsOpen(true);
  };

  const removeItem = (id: string, slug: string, size: string, colorName: string) => {
    setItems(
      items.filter(
        (item) =>
          !(
            item.id === id &&
            item.slug === slug &&
            item.size === size &&
            item.color.name === colorName
          ),
      ),
    );
  };

  const updateQuantity = (
    id: string,
    slug: string,
    size: string,
    colorName: string,
    quantity: number,
  ) => {
    setItems(
      items.map((item) => {
        if (
          item.id === id &&
          item.slug === slug &&
          item.size === size &&
          item.color.name === colorName
        ) {
          return { ...item, quantity };
        }

        return item;
      }),
    );
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        openCart,
        closeCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
