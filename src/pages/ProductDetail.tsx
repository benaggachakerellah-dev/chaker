import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-lg">Product not found</p>
        <button onClick={() => navigate('/catalog')} className="btn-primary mt-4">
          Back to Catalog
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product.id, quantity, product.price);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const batch = product.traceability;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-desert-gold hover:text-amber-date mb-8">
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {/* Product Image */}
        <div>
          <img src={product.image} alt={product.name} className="w-full rounded-xl shadow-lg" />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{product.description}</p>

          <div className="card mb-6">
            <p className="text-2xl font-bold text-desert-gold mb-4">${product.price.toFixed(2)}</p>
            <p className="text-sm mb-4">Variety: <span className="font-semibold">{product.variety.name}</span></p>
            <p className="text-sm mb-4">Farm: <span className="font-semibold">{product.farm.name}</span></p>
            <p className="text-sm mb-6">Weight: <span className="font-semibold">{product.weight}g</span></p>

            <div className="flex items-center gap-4 mb-6">
              <label className="font-semibold">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="px-4 py-2 border border-desert-gold rounded"
              >
                {[1, 2, 3, 4, 5, 10].map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            {addedToCart && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Added to cart!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traceability Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-serif font-bold mb-6">Batch Traceability & Quality Inspection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-desert-gold">Batch Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Batch ID:</span> {batch.id}</p>
              <p><span className="font-semibold">Harvest Date:</span> {new Date(batch.harvestDate).toLocaleDateString()}</p>
              <p><span className="font-semibold">Grade A:</span> {batch.gradeA} / {batch.batchSize} units</p>
              <p><span className="font-semibold">Certification:</span> {batch.certification}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-desert-gold">Inspection Results</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Sugar Content:</span> {batch.inspection.sugarContent}° Brix</p>
              <p><span className="font-semibold">Moisture:</span> {batch.inspection.moisture}%</p>
              <p><span className="font-semibold">Size Grade:</span> {batch.inspection.size}</p>
              <p><span className="font-semibold">Test Date:</span> {new Date(batch.inspection.labTestDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="card md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-desert-gold">Lab Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(batch.inspection.testResults).map(([test, result]) => (
                <div key={test} className="p-3 bg-desert-light rounded">
                  <p className="text-sm font-semibold capitalize">{test.replace(/_/g, ' ')}</p>
                  <p className="text-sm">{result}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">Inspector: {batch.inspection.inspector}</p>
          </div>
        </div>
      </section>

      {/* Farm Information */}
      <section>
        <h2 className="text-3xl font-serif font-bold mb-6">About the Farm</h2>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src={product.farm.image} alt={product.farm.name} className="w-full rounded-lg" />
            <div>
              <h3 className="text-2xl font-semibold mb-2">{product.farm.name}</h3>
              <p className="text-gray-600 mb-4">{product.farm.region}, {product.farm.country}</p>
              <p className="mb-4">{product.farm.description}</p>
              <p className="text-sm mb-4"><span className="font-semibold">Established:</span> {product.farm.established}</p>
              <div className="flex gap-2 flex-wrap">
                {product.farm.certification.map((cert) => (
                  <span key={cert} className="text-xs bg-desert-gold text-desert-dark px-3 py-1 rounded-full font-semibold">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
