'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Cart, CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  addItem: (product: Product, quantity?: number, shopHandle?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextValue>({
  cart: null,
  itemCount: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotal: () => 0,
});

const CART_STORAGE_KEY = 'popzop_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  function persistCart(newCart: Cart | null) {
    setCart(newCart);
    if (newCart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  function addItem(product: Product, quantity = 1, shopHandle = '') {
    setCart((prev) => {
      const base: Cart = prev ?? {
        items: [],
        merchantId: product.merchantId,
        shopHandle,
      };

      // If adding from a different merchant, reset cart
      if (prev && prev.merchantId !== product.merchantId) {
        toast.error('Cart cleared — you can only order from one shop at a time');
        const newCart: Cart = {
          items: [{ product, quantity }],
          merchantId: product.merchantId,
          shopHandle,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        return newCart;
      }

      const existingIndex = base.items.findIndex(
        (i) => i.product.id === product.id
      );

      let items: CartItem[];
      if (existingIndex >= 0) {
        items = base.items.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  product.quantityAvailable
                ),
              }
            : item
        );
      } else {
        items = [...base.items, { product, quantity }];
      }

      const newCart = { ...base, items, shopHandle: base.shopHandle || shopHandle };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return newCart;
    });
    toast.success('Added to cart');
  }

  function removeItem(productId: string) {
    setCart((prev) => {
      if (!prev) return null;
      const items = prev.items.filter((i) => i.product.id !== productId);
      const newCart = items.length === 0 ? null : { ...prev, items };
      if (newCart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      return newCart;
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) => {
      if (!prev) return null;
      const items = prev.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
      const newCart = { ...prev, items };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return newCart;
    });
  }

  function clearCart() {
    persistCart(null);
  }

  function getTotal(): number {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, itemCount, addItem, removeItem, updateQuantity, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
