import { Link } from 'react-router-dom';
import { MapPin, Award, Leaf } from 'lucide-react';
import { farms } from '../data/mockData';

export const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-desert-dark to-amber-date text-desert-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl font-bold mb-6">Desert Gold</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Premium dates and date products from the world's most prestigious farms, with complete batch-level traceability and quality inspection.
          </p>
          <Link to="/catalog" className="btn-primary inline-block">
            Shop Premium Dates
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-desert-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">Why Choose Desert Gold</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <Award className="w-12 h-12 text-desert-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p>Hand-selected dates from certified farms with rigorous quality inspection and grading standards.</p>
            </div>
            <div className="card">
              <MapPin className="w-12 h-12 text-desert-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Full Traceability</h3>
              <p>Batch-level transparency with complete harvest, inspection, and lab test data for every product.</p>
            </div>
            <div className="card">
              <Leaf className="w-12 h-12 text-desert-gold mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
              <p>Supporting traditional farming practices and fair trade partnerships with global date producers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Farms Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold mb-12">Our Partner Farms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {farms.map((farm) => (
              <div key={farm.id} className="card overflow-hidden hover:shadow-2xl transition">
                <img src={farm.image} alt={farm.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">{farm.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{farm.region}, {farm.country}</p>
                <p className="mb-4">{farm.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {farm.certification.map((cert) => (
                    <span key={cert} className="text-xs bg-desert-gold text-desert-dark px-3 py-1 rounded-full font-semibold">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-desert-dark text-desert-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Experience Premium Dates Today</h2>
          <Link to="/catalog" className="btn-primary inline-block">
            Browse Catalog
          </Link>
        </div>
      </section>
    </div>
  );
};
