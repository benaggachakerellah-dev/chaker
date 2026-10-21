import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/mockData';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const [demoCheckoutComplete, setDemoCheckoutComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleDemoCheckout = () => {
    if (items.length === 0) return;
    const generatedId = `DEMO-ORDER-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setDemoCheckoutComplete(true);
    clearCart();
  };

  if (demoCheckoutComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="card bg-white p-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-2">Demo Checkout Successful</h1>
          <p className="text-gray-600 mb-4">
            This is a simulation demonstration. No real payment was collected and no real order was transmitted.
          </p>
          <div className="bg-desert-light p-4 rounded-lg mb-6 inline-block text-left">
            <p className="text-sm"><span className="font-semibold">Demo Order Reference:</span> {orderId}</p>
            <p className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleString()}</p>
            <p className="text-sm"><span className="font-semibold">Status:</span> Simulated Demo Order</p>
          </div>
          <div>
            <button
              onClick={() => {
                setDemoCheckoutComplete(false);
                navigate('/catalog');
              }}
              className="btn-primary inline-block"
            >
              Continue Shopping Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="card py-16">
          <ShoppingBag className="w-16 h-16 text-desert-gold mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Discover our premium demo selection of dates with complete traceability.</p>
          <Link to="/catalog" className="btn-primary inline-flex items-center gap-2">
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="card flex flex-col sm:flex-row items-center gap-4">
                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.variety.name} • {product.farm.name}</p>
                  <p className="text-desert-gold font-bold">${item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-desert-gold rounded">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-desert-light transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-desert-light transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:underline"
            >
              Clear Cart
            </button>
            <Link to="/catalog" className="text-sm text-desert-gold font-semibold hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Demo Checkout */}
        <div>
          <div className="card sticky top-24">
            <h3 className="text-xl font-serif font-bold mb-4">Order Summary</h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping (Demo Standard)</span>
                <span>$5.00</span>
              </div>
              <div className="border-t border-desert-light pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-desert-gold">${(totalPrice + 5).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <span className="font-bold">Notice:</span> This is a demonstration e-commerce app. Clicking checkout initiates a simulated demo order only.
            </div>

            <button
              onClick={handleDemoCheckout}
              className="btn-primary w-full text-center py-3 font-semibold"
            >
              Proceed to Demo Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
