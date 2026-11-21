# Sattr (سطر)

Single-product, SEO-first shop for the Sattr Gift Pack, with an admin panel. One Laravel app: Inertia + React + TypeScript on the front, server-side rendered, Arabic (default, RTL) and English.

- **Stack:** Laravel 13, Inertia v3, React 19, TypeScript, Vite, Tailwind CSS v4, MySQL, Redis, Horizon, Pest, Pint.
- **Payments:** manual InstaPay (10% off, verified by an admin) and cash on delivery. No gateway yet; see [Adding a payment gateway](#adding-a-payment-gateway).
- **Languages:** `/ar/...` and `/en/...`. `/` redirects by `Accept-Language`, defaulting to Arabic.

## Local setup

Requirements: PHP 8.3+ (with `imagick` or `gd`, `redis`, `intl`), Composer, Node 22+, MySQL 8, Redis.

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Edit `.env`: set the database credentials, `APP_URL`, and `ADMIN_EMAIL` / `ADMIN_PASSWORD` (the seeder creates this admin). Then:

```bash
mysql -u root -p -e "CREATE DATABASE sattr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
npm run build:ssr
```

Run it (four processes; with Laravel Herd the web server is already running):

```bash
php artisan inertia:start-ssr   # server-side rendering
php artisan horizon             # queues: emails, Telegram, tracking, AVIF images
php artisan schedule:work       # hourly: flag unpaid InstaPay orders
npm run dev                     # only while developing the front end
```

- Shop: `APP_URL/ar` and `APP_URL/en`
- Admin: `APP_URL/admin` (sign in with the seeded admin, then turn on two-factor under Settings → Security)
- Queue dashboard: `APP_URL/horizon` (admins only)

The seed creates the Gift Pack (849 EGP, 10% InstaPay discount), 8 faculty designs with 75 packs of stock, 8 faculty landing pages, 5 FAQ items, 5 static pages, 3 journal articles and the admin user. **No product photographs are seeded.** Upload them in the admin (Catalog → Product, Catalog → Designs); until then the site shows drawn placeholders.

### Tests and code style

```bash
php artisan test        # Pest, runs on in-memory SQLite
vendor/bin/pint         # PHP formatting
npm run types:check     # TypeScript
npm run check           # lint + format (front end)
```

## Environment variables

Everything in the second half of this table can also be set in Admin → Settings, and a value saved there wins over `.env`.

| Variable                                                                         | Purpose                                                                                                   |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `APP_URL`                                                                        | Public URL. Used for canonical URLs, sitemaps and feeds. Must be the final https URL in production.       |
| `APP_LOCALE`                                                                     | Keep `ar`.                                                                                                |
| `DB_*`                                                                           | MySQL connection.                                                                                         |
| `REDIS_*`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis` | Redis for cache, queues (Horizon) and sessions.                                                           |
| `MAIL_*`                                                                         | Outgoing mail for receipts and admin alerts.                                                              |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`                                    | Admin created by `db:seed`. If the password is empty a random one is printed once.                        |
| `RESPONSE_CACHE_ENABLED`                                                         | Full-page cache for public pages. `true` in production, `false` while developing.                         |
| `INERTIA_SSR_ENABLED`                                                            | Server-side rendering. Keep `true`.                                                                       |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`                                     | Cloudflare Turnstile on checkout. Off when empty.                                                         |
| `ORDER_RATE_LIMIT`                                                               | Orders allowed per hour per IP and per phone (default 5).                                                 |
| `INDEXNOW_KEY`                                                                   | Optional. Pings IndexNow (Bing and others) when content is published. Also serve the key at `/{key}.txt`. |
| `INSTAPAY_IPA`, `INSTAPAY_PHONE`                                                 | Shown to customers paying by InstaPay. The QR image is uploaded in the admin.                             |
| `WHATSAPP_NUMBER`, `CONTACT_EMAIL`                                               | Contact details (WhatsApp in international format, e.g. `201012345678`).                                  |
| `ADMIN_NOTIFICATION_EMAIL`                                                       | Receives new-order and payment-proof alerts.                                                              |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`                                         | Optional Telegram alerts.                                                                                 |
| `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`                                           | Google Analytics 4 (browser) and Measurement Protocol (server).                                           |
| `META_PIXEL_ID`, `META_CAPI_TOKEN`                                               | Meta Pixel (browser) and Conversions API (server, deduplicated by `event_id`).                            |
| `POSTHOG_KEY`, `POSTHOG_HOST`                                                    | PostHog.                                                                                                  |
| `TIKTOK_PIXEL_ID`, `TIKTOK_ACCESS_TOKEN`                                         | TikTok Pixel (browser) and Events API (server).                                                           |

With no tracking IDs set, no tracking script loads and no cookie banner appears.

## How it is put together

| Area                                                              | Where                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Order creation (transaction, row lock on stock, `SAT-XXXXX` code) | `app/Actions/Orders/CreateOrder.php`                                                            |
| Payment methods                                                   | `app/Payments/` (`PaymentMethodContract`, `InstaPayManual`, `CashOnDelivery`, `PaymentManager`) |
| Proof upload, verify, reject, status changes                      | `app/Actions/Orders/`                                                                           |
| What happens after each order event (emails, Telegram, tracking)  | `app/Listeners/OrderEventSubscriber.php`                                                        |
| SEO head and JSON-LD                                              | `app/Services/Seo/`, rendered by `resources/views/partials/seo.blade.php`                       |
| Sitemap, robots, product feeds                                    | `app/Http/Controllers/Site/{Sitemap,Robots,Feed}Controller.php`                                 |
| Full-page cache and its invalidation                              | `app/Support/PublicPagesCacheProfile.php`, `app/Services/SiteChrome.php::flush()`               |
| Tracking                                                          | browser: `resources/js/lib/track.ts`; server: `app/Services/Tracking/`                          |
| Storefront copy                                                   | `lang/ar/site.php`, `lang/en/site.php`                                                          |
| Storefront pages and components                                   | `resources/js/pages/site/`, `resources/js/components/site/`                                     |
| Admin                                                             | `routes/admin.php`, `app/Http/Controllers/Admin/`, `resources/js/pages/admin/`                  |

Money is stored as integers in piasters. All totals and discounts are calculated on the server; amounts sent by the browser are ignored.

### SEO notes

- Every public page is server-rendered. The `<head>` (title, description, canonical, `hreflang` ar/en/x-default, Open Graph, JSON-LD) is written by Blade, so it is present even if the SSR process is down.
- Products, faculty pages, articles and static pages have editable meta title, meta description, OG image, canonical and noindex in the admin. Blank fields use automatic defaults.
- `/sitemap.xml` is an index of `/sitemaps/{pages,faculties,articles,images}.xml`. `/robots.txt` blocks everything outside production.
- Feeds: `/feeds/google.xml` (Google Merchant Center) and `/feeds/meta.xml` (Meta catalog). Add `?locale=en` for English. Feeds need product photos to be accepted.
- Google no longer accepts sitemap pings; it reads `lastmod`. Publishing pings IndexNow when `INDEXNOW_KEY` is set.
- AggregateRating appears in the Product data only once at least one review is approved.

### Adding a payment gateway

1. Add a case to `App\Enums\PaymentMethod` and its labels in `lang/*/orders.php` and `lang/*/site.php` (`checkout.{key}`, `checkout.{key}_body`).
2. Create a class implementing `App\Payments\PaymentMethodContract`.
3. Register it in `App\Payments\PaymentManager::$methods`.

Checkout lists whatever the manager returns and prices each option through the contract, so nothing in checkout changes.

## Production (Ubuntu + Nginx + Supervisor)

Assumes Ubuntu 24.04, PHP 8.4-FPM, Node 22, MySQL 8, Redis, and the app in `/var/www/sattr`. On Laravel Forge or Ploi, the same pieces map to: site + "Inertia SSR" daemon, "Horizon" daemon, scheduler toggle, and the deploy script below.

### First deploy

```bash
cd /var/www/sattr
composer install --no-dev --optimize-autoloader
npm ci && npm run build:ssr
cp .env.example .env && php artisan key:generate   # then edit .env
php artisan migrate --force --seed
php artisan storage:link
php artisan optimize
```

Production `.env` essentials: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://your-domain`, `RESPONSE_CACHE_ENABLED=true`, real `MAIL_*`, and a strong `ADMIN_PASSWORD`.

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name sattr.example www.sattr.example;
    root /var/www/sattr/public;
    index index.php;
    charset utf-8;
    client_max_body_size 10m;            # payment proofs (5 MB) and product images (8 MB)

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml application/xml;

    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location /storage/ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    location / {
        try_files $uri /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* { deny all; }
}
```

Use `try_files $uri /index.php?$query_string` exactly as shown (no `$uri/`), so trailing-slash URLs reach Laravel and get their 301. Redirect `www` and `http` to the one canonical host.

### Supervisor: SSR and Horizon

`/etc/supervisor/conf.d/sattr.conf`

```ini
[program:sattr-ssr]
command=php /var/www/sattr/artisan inertia:start-ssr
directory=/var/www/sattr
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stdout_logfile=/var/www/sattr/storage/logs/ssr.log
redirect_stderr=true

[program:sattr-horizon]
command=php /var/www/sattr/artisan horizon
directory=/var/www/sattr
user=www-data
autostart=true
autorestart=true
stopwaitsecs=3600
stdout_logfile=/var/www/sattr/storage/logs/horizon.log
redirect_stderr=true
```

```bash
sudo supervisorctl reread && sudo supervisorctl update
```

### Scheduler

```cron
* * * * * www-data cd /var/www/sattr && php artisan schedule:run >> /dev/null 2>&1
```

### Every later deploy

```bash
cd /var/www/sattr
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build:ssr
php artisan migrate --force
php artisan optimize
php artisan responsecache:clear          # cached pages embed asset URLs
php artisan horizon:terminate            # Supervisor restarts it with the new code
php artisan inertia:stop-ssr             # Supervisor restarts it with the new bundle
```

### After launch

1. Admin → Settings: InstaPay address, phone and QR; WhatsApp number; notification email.
2. Admin → Catalog: upload product and design photographs (alt text is required for each).
3. Add the tracking IDs you use; the cookie banner appears automatically once one is set.
4. Submit `https://your-domain/sitemap.xml` in Google Search Console and add the feeds to Merchant Center and Meta Commerce Manager.
5. Review the seeded copy (product specs, delivery times, returns policy) against what you actually ship.
