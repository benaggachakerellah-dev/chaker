import React, { useState } from 'react';
import { Search, ShieldCheck, MapPin, Calendar, Award, AlertCircle, Info } from 'lucide-react';
import { products, farms } from '../data/mockData';
import { Product } from '../types/index';

export const Traceability: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedBatch, setSearchedBatch] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const found = products.find(
      (p) => p.batchId.toUpperCase() === query || p.id.toUpperCase() === query
    );

    if (found) {
      setSearchedBatch(found);
      setNotFound(false);
    } else {
      setSearchedBatch(null);
      setNotFound(true);
    }
  };

  const sampleBatches = products.map((p) => p.batchId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Batch Traceability & Quality Lookup</h1>
        <p className="text-gray-600 mb-4">
          Enter any demo batch ID to verify origin, harvest parameters, laboratory test results, and quality certifications.
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-lg text-xs font-semibold">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />
          <span>DEMO NOTICE: All inspection metrics, Brix ratings, and lab test results are synthetic demonstration data.</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. BATCH-MED-2024-01"
              className="w-full pl-10 pr-4 py-3 border border-desert-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-desert-gold bg-white"
            />
          </div>
          <button type="submit" className="btn-primary">
            Verify Batch
          </button>
        </form>

        <div className="mt-3 flex items-center gap-2 flex-wrap justify-center text-xs text-gray-500">
          <span>Sample demo batches:</span>
          {sampleBatches.map((bId) => (
            <button
              key={bId}
              onClick={() => {
                setSearchQuery(bId);
                const found = products.find((p) => p.batchId === bId);
                if (found) {
                  setSearchedBatch(found);
                  setNotFound(false);
                }
              }}
              className="bg-desert-light px-2 py-1 rounded text-desert-dark hover:bg-desert-gold transition"
            >
              {bId}
            </button>
          ))}
        </div>
      </div>

      {/* Not Found State */}
      {notFound && (
        <div className="max-w-md mx-auto card text-center py-8">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Batch Not Found</h3>
          <p className="text-sm text-gray-600">
            No demonstration batch record matches "{searchQuery}". Please try one of the sample batch IDs listed above.
          </p>
        </div>
      )}

      {/* Traceability Result */}
      {searchedBatch && (
        <div className="space-y-8">
          <div className="card bg-white border-2 border-desert-gold">
            {/* Explicit Demo Banner */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  SYNTHETIC DEMO RECORD: Not a certified real-world laboratory report.
                </span>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                DEMO ONLY
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-desert-light">
              <div>
                <h2 className="text-2xl font-serif font-bold mt-2">{searchedBatch.name}</h2>
                <p className="text-sm text-gray-600">Batch ID: <span className="font-mono font-semibold">{searchedBatch.traceability.id}</span></p>
              </div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold text-sm">Verified Demo Inspection</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-desert-light p-4 rounded-lg">
                <div className="flex items-center gap-2 text-desert-gold mb-2">
                  <MapPin className="w-5 h-5" />
                  <h4 className="font-semibold">Origin & Farm</h4>
                </div>
                <p className="font-semibold">{searchedBatch.farm.name}</p>
                <p className="text-sm text-gray-600">{searchedBatch.farm.region}, {searchedBatch.farm.country}</p>
                <p className="text-xs text-gray-500 mt-1">Established: {searchedBatch.farm.established}</p>
              </div>

              <div className="bg-desert-light p-4 rounded-lg">
                <div className="flex items-center gap-2 text-desert-gold mb-2">
                  <Calendar className="w-5 h-5" />
                  <h4 className="font-semibold">Harvest Details</h4>
                </div>
                <p className="text-sm"><span className="font-semibold">Harvest Date:</span> {searchedBatch.traceability.harvestDate}</p>
                <p className="text-sm"><span className="font-semibold">Batch Volume:</span> {searchedBatch.traceability.batchSize} units</p>
                <p className="text-sm"><span className="font-semibold">Grade A Yield:</span> {searchedBatch.traceability.gradeA} units</p>
              </div>

              <div className="bg-desert-light p-4 rounded-lg">
                <div className="flex items-center gap-2 text-desert-gold mb-2">
                  <Award className="w-5 h-5" />
                  <h4 className="font-semibold">Certification</h4>
                </div>
                <p className="font-semibold">{searchedBatch.traceability.certification}</p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {searchedBatch.farm.certification.map((c) => (
                    <span key={c} className="text-xs bg-white px-2 py-0.5 rounded border border-desert-gold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality & Lab Inspection */}
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">Laboratory Inspection Metrics (Synthetic Demo Data)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-desert-gold rounded-lg text-center bg-white">
                  <p className="text-sm text-gray-600">Sugar Content</p>
                  <p className="text-2xl font-bold text-desert-dark">{searchedBatch.traceability.inspection.sugarContent}° Brix</p>
                </div>
                <div className="p-4 border border-desert-gold rounded-lg text-center bg-white">
                  <p className="text-sm text-gray-600">Moisture Content</p>
                  <p className="text-2xl font-bold text-desert-dark">{searchedBatch.traceability.inspection.moisture}%</p>
                </div>
                <div className="p-4 border border-desert-gold rounded-lg text-center bg-white">
                  <p className="text-sm text-gray-600">Size Classification</p>
                  <p className="text-2xl font-bold text-desert-dark capitalize">{searchedBatch.traceability.inspection.size}</p>
                </div>
              </div>

              <div className="bg-desert-light p-6 rounded-lg border border-desert-gold">
                <h4 className="font-semibold mb-3">Microbiological & Chemical Test Panel (Demo Lab)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {Object.entries(searchedBatch.traceability.inspection.testResults).map(([test, result]) => (
                    <div key={test} className="bg-white p-3 rounded shadow-sm">
                      <p className="text-xs text-gray-500 uppercase">{test.replace(/_/g, ' ')}</p>
                      <p className="font-semibold text-sm text-green-700">{result}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600 border-t border-desert-gold pt-3">
                  <span>Lab Test Date: {searchedBatch.traceability.inspection.labTestDate}</span>
                  <span>Lead Inspector: {searchedBatch.traceability.inspection.inspector}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Showcase if no search yet */}
      {!searchedBatch && !notFound && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div key={farm.id} className="card">
              <img src={farm.image} alt={farm.name} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="font-semibold text-lg mb-1">{farm.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{farm.region}, {farm.country}</p>
              <p className="text-xs text-gray-500 mb-4">Certifications: {farm.certification.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
