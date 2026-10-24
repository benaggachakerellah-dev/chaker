import { locales } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params || { locale: 'ar' };
  
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Desert Gold</h1>
      <p>Welcome. Current locale: {locale}</p>
      <a href={`/${locale}/catalog`}>Go to Catalog</a>
    </div>
  );
}