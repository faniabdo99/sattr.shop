<?php

namespace App\Http\Requests\Admin;

use App\Rules\EgyptianMobile;

class SettingsRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'instapay_ipa' => ['nullable', 'string', 'max:120'],
            'instapay_phone' => ['nullable', 'string', 'regex:'.EgyptianMobile::PATTERN],
            'instapay_qr' => ['nullable', 'image', 'max:2048'],
            'contact_whatsapp' => ['nullable', 'string', 'regex:/^\+?\d{10,15}$/'],
            'contact_email' => ['nullable', 'email', 'max:190'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
            'social_facebook' => ['nullable', 'url', 'max:255'],
            'social_tiktok' => ['nullable', 'url', 'max:255'],
            'tracking_ga4_id' => ['nullable', 'string', 'max:40'],
            'tracking_ga4_api_secret' => ['nullable', 'string', 'max:120'],
            'tracking_gtm_id' => ['nullable', 'string', 'regex:/^GTM-[A-Z0-9]+$/', 'max:40'],
            'tracking_meta_pixel_id' => ['nullable', 'string', 'max:40'],
            'tracking_meta_capi_token' => ['nullable', 'string', 'max:500'],
            'tracking_posthog_key' => ['nullable', 'string', 'max:120'],
            'tracking_posthog_host' => ['nullable', 'url', 'max:255'],
            'tracking_tiktok_pixel_id' => ['nullable', 'string', 'max:40'],
            'tracking_tiktok_access_token' => ['nullable', 'string', 'max:500'],
            'seo_default_title' => ['array'],
            'seo_default_title.*' => ['nullable', 'string', 'max:70'],
            'seo_default_description' => ['array'],
            'seo_default_description.*' => ['nullable', 'string', 'max:170'],
            'seo_og_image' => ['nullable', 'image', 'max:4096'],
            'notifications_admin_email' => ['nullable', 'email', 'max:190'],
            'notifications_telegram_bot_token' => ['nullable', 'string', 'max:120'],
            'notifications_telegram_chat_id' => ['nullable', 'string', 'max:40'],
        ];
    }
}
