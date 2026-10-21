import { Link } from 'react-router-dom';
import { MapPin, Award, CheckCircle, Package } from 'lucide-react';
import { farms, products } from '../data/mockData';

export const Farms: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
          Demo Partner Estates
        </span>
        <h1 className="text-4xl font-serif font-bold mt-2 mb-4">Our Partner Farms</h1>
        <p className="text-gray-600">
          Meet our demonstration partner farms and estates committed to sustainable agriculture, traditional heritage, and rigorous quality standards.
        </p>
      </div>

      <div className="space-y-12">
        {farms.map((farm) => {
          const farmProducts = products.filter((p) => p.farm.id === farm.id);

          return (
            <div key={farm.id} className="card bg-white border border-desert-gold">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <img src={farm.image} alt={farm.name} className="w-full h-64 object-cover rounded-lg shadow-md" />
                </div>

                <div className="lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-serif font-bold">{farm.name}</h2>
                      <span className="text-xs bg-desert-light text-desert-dark px-3 py-1 rounded font-semibold">
                        Est. {farm.established}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4 text-desert-gold" />
                      <span>{farm.region}, {farm.country}</span>
                    </div>

                    <p className="text-gray-700 mb-6">{farm.description}</p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-desert-dark">
                        <Award className="w-4 h-4 text-desert-gold" /> Certifications & Standards
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {farm.certification.map((cert) => (
                          <span key={cert} className="text-xs bg-desert-light text-desert-dark px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-700" /> {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-1 text-desert-dark">
                      <Package className="w-4 h-4 text-desert-gold" /> Associated Demo Products ({farmProducts.length})
                    </h4>
                    <div className="flex gap-3 flex-wrap">
                      {farmProducts.map((prod) => (
                        <Link
                          key={prod.id}
                          to={`/product/${prod.id}`}
                          className="bg-desert-light hover:bg-desert-gold hover:text-desert-dark px-3 py-2 rounded text-sm transition font-medium flex items-center gap-2"
                        >
                          <span>{prod.name}</span>
                          <span className="text-xs bg-white px-2 py-0.5 rounded font-bold">${prod.price.toFixed(2)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
