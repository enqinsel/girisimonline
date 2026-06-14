# Girişim Online

Girişim Online, girişimcilik ve yatırım haberlerini tek akışta takip etmek için hazırlanmış sade bir Next.js + Supabase MVP'sidir.

Uygulama demo/fake haber göstermez. Supabase ayarları yapılmadan veya import çalışmadan ana akış boş görünür.

## Kurulum

1. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase değerlerini doldurun.
2. `supabase/schema.sql` dosyasını Supabase SQL editor'da çalıştırın.
3. `supabase/seed.sql` dosyasını çalıştırarak başlangıç kaynaklarını ekleyin.
4. Bağımlılıkları kurup uygulamayı başlatın:

```bash
npm install
npm run dev
```

## Import

Cron/import endpoint'i sadece `POST` kabul eder:

```bash
curl -X POST http://localhost:3000/api/import \
  -H "x-cron-secret: $CRON_SECRET"
```

Secret query param olarak kabul edilmez.

## Production Checklist

- Vercel env değerleri:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CRON_SECRET`
  - `ADMIN_EMAILS`
  - `NEXT_PUBLIC_SITE_URL`
  - `PRODUCT_HUNT_API_TOKEN`
- GitHub Actions secrets:
  - `SITE_URL`: Vercel production URL'i, örn. `https://girisimonline.com`
  - `CRON_SECRET`: Vercel'deki `CRON_SECRET` ile aynı değer
- Supabase Auth:
  - Email confirmation açık olmalı.
  - Custom SMTP Resend üzerinden bağlanmalı.
  - Domain alındığında Site URL ve Redirect URLs production domaine göre güncellenmeli.
  - Şifre sıfırlama redirect URL'i: `/sifre-yenile`
  - E-posta doğrulama dönüş URL'i: `/giris?verified=1`
- Admin:
  - Panel adresi `/ngin`.
  - `/admin` bilerek 404 döner.
  - Admin yetkisi sadece `ADMIN_EMAILS` allowlist ile verilir.
- Otomatik import:
  - `.github/workflows/nightly-import.yml` her gün `00:00 UTC` çalışır.
  - Türkiye saatiyle gece `03:00` import tetikler.
  - Admin panelde manuel import butonu yoktur.
