'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Locale, locales } from '@/lib/i18n/config';

export default function AuthPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAr = locale === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      // Get user role after login
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', (await supabase.auth.getUser()).data.user?.id)
  .single();

if (profile?.role === 'admin') {
  router.push(`/${locale}/admin`);
} else if (profile?.role === 'farm') {
  router.push(`/${locale}/farm`);
} else {
  router.push(`/${locale}/account/orders`);
}
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 border border-[#E7DED1]">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#3E2723]">
          {isAr ? (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد') : (isLogin ? 'Login' : 'Register')}
        </h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#E7DED1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{isAr ? 'كلمة المرور' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#E7DED1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3E2723] text-white py-3 rounded-lg font-medium hover:bg-[#3E2723]/90 transition disabled:opacity-50"
          >
            {loading ? (isAr ? 'جارٍ التحميل...' : 'Loading...') : (isAr ? (isLogin ? 'دخول' : 'تسجيل') : (isLogin ? 'Login' : 'Register'))}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          {isAr ? (isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟') : (isLogin ? "Don't have an account?" : 'Already have an account?')}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#D4AF37] font-bold hover:underline ms-1"
          >
            {isAr ? (isLogin ? 'إنشاء حساب' : 'تسجيل الدخول') : (isLogin ? 'Register' : 'Login')}
          </button>
        </p>

        <div className="mt-6 p-4 bg-[#F7F3EB] rounded-lg text-xs text-gray-700 border border-[#E7DED1]">
          <p className="font-bold mb-1">💡 {isAr ? 'حسابات تجريبية:' : 'Demo Accounts:'}</p>
          <ul className="space-y-1">
            <li>customer@desertgold.com / password123</li>
            <li>farm@desertgold.com / password123</li>
            <li>admin@desertgold.com / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}