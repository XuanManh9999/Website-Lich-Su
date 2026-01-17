// Cart utility functions using localStorage

const CART_KEY = 'vietnam_history_cart';

export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const addToCart = (product, quantity = 1) => {
  try {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // Product already in cart, update quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCart();
  }
};

export const removeFromCart = (productId) => {
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCart();
  }
};

export const updateCartQuantity = (productId, quantity) => {
  try {
    const cart = getCart();
    const updatedCart = cart.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    return updatedCart;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return getCart();
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    return getCart();
  }
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
