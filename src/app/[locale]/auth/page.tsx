'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AuthPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Fetch profile to redirect correctly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role || 'customer';
        if (role === 'admin') router.push(`/${locale}/admin`);
        else if (role === 'farm') router.push(`/${locale}/farm`);
        else router.push(`/${locale}/account/orders`);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'customer' }
          }
        });
        if (error) throw error;
        alert('Registration successful! Please sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white border border-[#E7DED1] rounded-lg p-8 shadow-subtle space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-[#35251C]">
            {isLogin ? (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (locale === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
          </h1>
          <p className="text-xs text-gray-500">
            {isLogin ? (locale === 'ar' ? 'أدخل بيانات حسابك للوصول إلى لوحة التحكم والطلبات' : 'Access your dashboard and orders') : (locale === 'ar' ? 'انضم إلى منصة الذهب الصحراوي' : 'Join the Desert Gold marketplace')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <Input
              required
              label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <Input
            required
            label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            required
            label={locale === 'ar' ? 'كلمة المرور' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
            {loading ? (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (isLogin ? (locale === 'ar' ? 'دخول' : 'Sign In') : (locale === 'ar' ? 'تسجيل' : 'Register'))}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-[#67402D] hover:underline font-medium"
          >
            {isLogin ? (locale === 'ar' ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : "Don't have an account? Sign up") : (locale === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign in')}
          </button>
        </div>
      </div>
    </div>
  );
}
