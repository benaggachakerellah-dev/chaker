import { createClient } from '@supabase/supabase-js';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export default async function CartPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const isAr = locale === 'ar';
  
  // Use SSR client with cookies
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { try { cookieStore.set({ name, value, ...options }); } catch (e) {} },
        remove(name, options) { try { cookieStore.set({ name, value: '', ...options }); } catch (e) {} },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{isAr ? 'سلة المشتريات' : 'Shopping Cart'}</h1>
        <p className="text-gray-600 mb-8">{isAr ? 'يجب تسجيل الدخول لعرض السلة.' : 'Please login to view your cart.'}</p>
        <Link href={`/${locale}/auth`} className="bg-[#3E2723] text-white px-6 py-3 rounded-lg inline-block">
          {isAr ? 'تسجيل الدخول' : 'Login'}
        </Link>
      </div>
    );
  }

  // Fetch cart for user
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

let items: any[] = []; 
 if (cart) {
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_variants (
          id,
          price_dzd,
          package_weight_g,
          products (name_ar, name_fr, name_en)
        )
      `)
      .eq('cart_id', cart.id);
    items = cartItems || [];
  }

  const total = items.reduce((sum: number, item: any) => {
    return sum + (item.product_variants?.price_dzd || 0) * item.quantity;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-[#FDFBF7] min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#3E2723]">{isAr ? 'سلة المشتريات' : 'Shopping Cart'}</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-xl mb-6">{isAr ? 'سلة المشتريات فارغة' : 'Your cart is empty'}</p>
          <Link href={`/${locale}/catalog`} className="bg-[#3E2723] text-white px-6 py-3 rounded-lg inline-block">
            {isAr ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => {
              const variant = item.product_variants;
              const product = variant?.products;
              const name = isAr ? product?.name_ar : product?.name_en;
              return (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-[#E7DED1] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#3E2723]">{name}</h3>
                    <p className="text-sm text-gray-600">
                      {variant?.package_weight_g}g - {variant?.price_dzd} DZD
                    </p>
                  </div>
                  <div className="text-center font-bold">
                    {item.quantity} ×
                  </div>
                  <div className="font-bold text-[#D4AF37]">
                    {(variant?.price_dzd || 0) * item.quantity} DZD
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7DED1] h-fit">
            <h2 className="text-xl font-bold mb-4 text-[#3E2723]">{isAr ? 'ملخص الطلب' : 'Order Summary'}</h2>
            <div className="flex justify-between mb-2">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-bold">{total} DZD</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>{isAr ? 'الشحن:' : 'Shipping:'}</span>
              <span>500 DZD</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
              <span>{total + 500} DZD</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              className="block w-full text-center bg-[#D4AF37] text-white py-3 rounded-lg mt-6 font-bold hover:bg-[#D4AF37]/90 transition"
            >
              {isAr ? 'متابعة الدفع' : 'Proceed to Checkout'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}