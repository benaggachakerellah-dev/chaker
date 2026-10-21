import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-desert-dark text-desert-light border-t border-desert-gold mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-desert-gold" />
              <span className="font-serif font-bold text-desert-gold">Desert Gold</span>
            </div>
            <p className="text-sm">Premium dates and date products from selected farms worldwide.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-desert-gold">Company</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-desert-gold transition">About Us</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Careers</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-desert-gold">Support</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-desert-gold transition">FAQ</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Shipping</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Returns</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-desert-gold">Legal</h3>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-desert-gold transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-desert-gold transition">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-desert-gold pt-8">
          <p className="text-center text-sm">© 2024 Desert Gold. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
