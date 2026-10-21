import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-desert-dark text-desert-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-desert-gold hover:text-amber-date transition">
            <Leaf className="w-6 h-6" />
            Desert Gold
          </Link>

          <div className="hidden md:flex gap-8">
            <Link to="/" className="hover:text-desert-gold transition">Home</Link>
            <Link to="/catalog" className="hover:text-desert-gold transition">Catalog</Link>
            <Link to="/traceability" className="hover:text-desert-gold transition">Traceability</Link>
            <Link to="/farms" className="hover:text-desert-gold transition">Farms</Link>
          </div>

          <Link to="/cart" className="relative p-2 hover:text-desert-gold transition" aria-label="Shopping Cart">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-desert-gold text-desert-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};
