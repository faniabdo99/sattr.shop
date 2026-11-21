<?php

return [

    'locales' => ['ar', 'en'],
    'default_locale' => 'ar',

    'admin' => [
        'name' => env('ADMIN_NAME', 'Sattr Admin'),
        'email' => env('ADMIN_EMAIL', 'admin@sattr.test'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'orders' => [
        'max_quantity' => 5,
        'rate_limit_per_hour' => (int) env('ORDER_RATE_LIMIT', 5),
        'instapay_flag_after_hours' => 24,
    ],

    'turnstile' => [
        'site_key' => env('TURNSTILE_SITE_KEY'),
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

    'indexnow_key' => env('INDEXNOW_KEY'),

    /*
    | Fallbacks for values that are normally edited in Admin → Settings.
    | A value saved in the admin always wins over these.
    */
    'defaults' => [
        'instapay.ipa' => env('INSTAPAY_IPA'),
        'instapay.phone' => env('INSTAPAY_PHONE'),
        'instapay.qr_path' => null,
        'contact.whatsapp' => env('WHATSAPP_NUMBER'),
        'contact.email' => env('CONTACT_EMAIL'),
        'social.instagram' => null,
        'social.facebook' => null,
        'social.tiktok' => null,
        'tracking.ga4_id' => env('GA4_MEASUREMENT_ID'),
        'tracking.ga4_api_secret' => env('GA4_API_SECRET'),
        'tracking.meta_pixel_id' => env('META_PIXEL_ID'),
        'tracking.meta_capi_token' => env('META_CAPI_TOKEN'),
        'tracking.posthog_key' => env('POSTHOG_KEY'),
        'tracking.posthog_host' => env('POSTHOG_HOST', 'https://eu.i.posthog.com'),
        'tracking.tiktok_pixel_id' => env('TIKTOK_PIXEL_ID'),
        'tracking.tiktok_access_token' => env('TIKTOK_ACCESS_TOKEN'),
        'seo.default_title' => ['ar' => 'سطر — أساسيات المكتب', 'en' => 'Sattr — Desk Essentials'],
        'seo.default_description' => [
            'ar' => 'طقم هدايا لطلاب الجامعات بتصميم كليتك: نوت بوك، مج، كوسترز وقلم في علبة هدايا فاخرة. شحن مجاني لكل محافظات مصر.',
            'en' => 'A faculty-designed gift pack for university students: notebook, mug, coasters and pen in a rigid gift box. Free delivery across Egypt.',
        ],
        'seo.og_image_path' => null,
        'notifications.admin_email' => env('ADMIN_NOTIFICATION_EMAIL', env('ADMIN_EMAIL')),
        'notifications.telegram_bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'notifications.telegram_chat_id' => env('TELEGRAM_CHAT_ID'),
    ],

    /* Settings that must never be sent to the browser. */
    'secret_settings' => [
        'tracking.ga4_api_secret',
        'tracking.meta_capi_token',
        'tracking.tiktok_access_token',
        'notifications.telegram_bot_token',
    ],
];
