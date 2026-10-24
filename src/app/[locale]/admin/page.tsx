import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { updateFarmStatus, updateFarmCommission, toggleProductActive, updatePlatformSetting, createPayout } from '@/modules/admin/actions';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminDashboardPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  // RBAC check
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    redirect(`/${locale}`);
  }

  // Fetch metrics & lists
  const [
    { count: totalOrders },
    { data: ordersData },
    { data: farmsData },
    { data: productsData },
    { data: settingsData },
    { data: pendingQCCount }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('farms').select('*').order('name'),
    supabase.from('products').select('*, farms(name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('platform_settings').select('*'),
    supabase.from('batches').select('*', { count: 'exact', head: true }).eq('qc_status', 'pending')
  ]);

  const totalRevenue = ordersData?.reduce((acc, o) => acc + (Number(o.total) || 0), 0) || 0;
  const totalCommissions = ordersData?.reduce((acc, o) => acc + (Number(o.subtotal) * 0.1 || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <h1 className="text-3xl font-serif font-bold text-desert-dark">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform management, metrics, farm approvals, and settlements.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Total Orders</div>
          <div className="text-3xl font-bold font-serif text-desert-dark mt-2">{totalOrders || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-3xl font-bold font-serif text-desert-dark mt-2">{totalRevenue.toLocaleString()} DZD</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Total Commissions</div>
          <div className="text-3xl font-bold font-serif text-desert-dark mt-2">{totalCommissions.toLocaleString()} DZD</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Pending QC Inspections</div>
          <div className="text-3xl font-bold font-serif text-desert-dark mt-2">{pendingQCCount || 0}</div>
        </div>
      </div>

      {/* Farm Management Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 border-b pb-3">Farm Management & Approvals</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (%)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {farmsData?.map((farm) => (
                <tr key={farm.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{farm.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{farm.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      farm.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {farm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(Number(farm.commission_rate || 0.10) * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <form action={async (formData) => {
                      'use server';
                      const status = formData.get('status') as 'approved' | 'suspended';
                      await updateFarmStatus(farm.id, status);
                    }} className="inline">
                      <input type="hidden" name="status" value={farm.status === 'approved' ? 'suspended' : 'approved'} />
                      <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        farm.status === 'approved' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}>
                        {farm.status === 'approved' ? 'Suspend' : 'Approve'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Moderation Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 border-b pb-3">Product Catalog Moderation</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData?.map((prod) => (
                <tr key={prod.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prod.name_en || prod.name_ar}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.farms?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      prod.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prod.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async () => {
                      'use server';
                      await toggleProductActive(prod.id, prod.is_active === false);
                    }} className="inline">
                      <button type="submit" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium transition">
                        {prod.is_active !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlements & Payouts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 border-b pb-3">Settlements & Payouts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Owed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {farmsData?.map((farm) => (
                <tr key={farm.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{farm.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">50,000 DZD</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async () => {
                      'use server';
                      await createPayout(farm.id, 50000);
                    }} className="inline">
                      <button type="submit" className="text-xs bg-desert-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-desert-gold/90 transition">
                        Execute Payout
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
