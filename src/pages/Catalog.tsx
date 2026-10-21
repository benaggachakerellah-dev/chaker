import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';

export const Catalog: React.FC = () => {
  const { addItem } = useCart();
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);

  const filteredProducts = selectedVariety
    ? products.filter((p) => p.variety.id === selectedVariety)
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Premium Dates Catalog</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Filter by Variety</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedVariety(null)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  selectedVariety === null ? 'bg-desert-gold text-desert-dark' : 'hover:bg-desert-light'
                }`}
              >
                All Varieties
              </button>
              {Array.from(new Set(products.map((p) => p.variety.id))).map((varietyId) => {
                const variety = products.find((p) => p.variety.id === varietyId)?.variety;
                return (
                  <button
                    key={varietyId}
                    onClick={() => setSelectedVariety(varietyId)}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      selectedVariety === varietyId ? 'bg-desert-gold text-desert-dark' : 'hover:bg-desert-light'
                    }`}
                  >
                    {variety?.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card overflow-hidden hover:shadow-xl transition flex flex-col">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.variety.name}</p>
                <p className="text-sm mb-4 flex-grow">{product.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-desert-gold">${product.price.toFixed(2)}</span>
                  <span className="text-sm bg-desert-light px-3 py-1 rounded">{product.weight}g</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="flex-1 px-4 py-2 bg-desert-dark text-desert-light rounded hover:bg-amber-date hover:text-desert-dark transition text-center font-semibold"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => addItem(product.id, 1, product.price)}
                    className="flex-1 px-4 py-2 bg-desert-gold text-desert-dark rounded hover:bg-amber-date transition font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
