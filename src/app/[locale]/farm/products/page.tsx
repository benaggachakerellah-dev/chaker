import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmProductsPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: farm } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();
  const farmId = farm?.id;

  const { data: products } = await supabase.from('products').select('*, product_variants(*)').eq('farm_id', farmId);
  const { data: categories } = await supabase.from('categories').select('*');

  async function addProduct(formData: FormData) {
    'use server';
    const supabaseServer = createClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    const { data: currentFarm } = await supabaseServer.from('farms').select('id').eq('owner_id', currentUser.id).single();
    if (!currentFarm) return;

    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const price = Number(formData.get('price')) || 1000;
    const stock = Number(formData.get('stock')) || 100;

    const { data: prod } = await supabaseServer.from('products').insert({
      farm_id: currentFarm.id,
      category_id: categoryId || null,
      name_ar: name,
      name_en: name,
      name_fr: name,
      description_ar: name,
      grade: 'premium',
      is_active: true
    }).select('id').single();

    if (prod) {
      await supabaseServer.from('product_variants').insert({
        product_id: prod.id,
        sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        weight_grams: 1000,
        price_dzd: price,
        stock_qty: stock,
        is_active: true
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/${locale}/farm/dashboard`} className="text-xs font-medium text-[#67402D] hover:underline">
            ← {isAr ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-2">
            {isAr ? 'إدارة منتجات المزرعة' : 'Manage Products'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle h-fit space-y-4">
          <h3 className="font-serif font-bold text-base text-[#35251C] border-b border-[#E7DED1] pb-3">
            {isAr ? 'إضافة منتج جديد' : 'Add New Product'}
          </h3>
          <form action={addProduct} className="space-y-4">
            <Input required label={isAr ? 'اسم المنتج' : 'Product Name'} name="name" type="text" />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#35251C]">{isAr ? 'التصنيف' : 'Category'}</label>
              <select name="categoryId" className="w-full px-3.5 py-2.5 bg-white border border-[#E7DED1] rounded-lg text-sm">
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{isAr ? cat.name_ar : (cat.name_en || cat.name_ar)}</option>
                ))}
              </select>
            </div>
            <Input required label={isAr ? 'السعر (DZD)' : 'Price (DZD)'} name="price" type="number" defaultValue="1500" />
            <Input required label={isAr ? 'المخزون' : 'Stock Qty'} name="stock" type="number" defaultValue="200" />
            <Button type="submit" size="sm" className="w-full py-2.5">
              {isAr ? 'إضافة المنتج' : 'Add Product'}
            </Button>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2 bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle space-y-4">
          <h3 className="font-serif font-bold text-base text-[#35251C] border-b border-[#E7DED1] pb-3">
            {isAr ? 'المنتجات الحالية' : 'Current Products'}
          </h3>
          <div className="divide-y divide-[#E7DED1]">
            {products && products.length > 0 ? (
              products.map((p: any) => (
                <div key={p.id} className="py-4 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-bold text-[#35251C]">{isAr ? p.name_ar : (p.name_en || p.name_ar)}</div>
                    <div className="text-xs text-gray-500">Grade: {p.grade} | Status: {p.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#67402D]">{p.product_variants?.[0]?.price_dzd || 0} DZD</div>
                    <div className="text-xs text-gray-500">Stock: {p.product_variants?.[0]?.stock_qty || 0}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">{isAr ? 'لا توجد منتجات مسجلة.' : 'No products found.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
