import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import ProductModel from '../models/product';

interface CartContext {
  products: ProductModel[];
  addToCart(item: ProductModel): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const KEY_STORAGE = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<ProductModel[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // para remover os dados do storage para testes
      // await AsyncStorage.clear();
      const productsStorage = await AsyncStorage.getItem(KEY_STORAGE);

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const indexProduct = products.findIndex(prod => prod.id === product.id);
      if (indexProduct > -1) {
        const newProducts = [...products];
        newProducts[indexProduct].quantity += 1;
        setProducts(newProducts);
      } else {
        setProducts([
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ]);
      }

      await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(products));
    },
    [products],
  );

  const updateQuantity = useCallback(
    async (action: string, id: string) => {
      const indexProduct = products.findIndex(prod => prod.id === id);
      if (indexProduct > -1) {
        const newProducts = [...products];
        if (action === 'increment') {
          newProducts[indexProduct].quantity += 1;
        } else {
          newProducts[indexProduct].quantity -= 1;
        }
        setProducts(newProducts);
      }

      await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      updateQuantity('increment', id);
    },
    [updateQuantity],
  );

  const decrement = useCallback(
    async id => {
      updateQuantity('decrement', id);
    },
    [updateQuantity],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
