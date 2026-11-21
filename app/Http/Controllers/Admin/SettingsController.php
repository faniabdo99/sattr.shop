<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsRequest;
use App\Services\Settings;
use App\Services\SiteChrome;
use App\Services\Tracking\Tracker;
use App\Services\Tracking\TrackingDriver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /** Form field => settings key. Files are handled separately. */
    private const FIELDS = [
        'instapay_ipa' => 'instapay.ipa',
        'instapay_phone' => 'instapay.phone',
        'contact_whatsapp' => 'contact.whatsapp',
        'contact_email' => 'contact.email',
        'social_instagram' => 'social.instagram',
        'social_facebook' => 'social.facebook',
        'social_tiktok' => 'social.tiktok',
        'tracking_ga4_id' => 'tracking.ga4_id',
        'tracking_ga4_api_secret' => 'tracking.ga4_api_secret',
        'tracking_meta_pixel_id' => 'tracking.meta_pixel_id',
        'tracking_meta_capi_token' => 'tracking.meta_capi_token',
        'tracking_posthog_key' => 'tracking.posthog_key',
        'tracking_posthog_host' => 'tracking.posthog_host',
        'tracking_tiktok_pixel_id' => 'tracking.tiktok_pixel_id',
        'tracking_tiktok_access_token' => 'tracking.tiktok_access_token',
        'seo_default_title' => 'seo.default_title',
        'seo_default_description' => 'seo.default_description',
        'notifications_admin_email' => 'notifications.admin_email',
        'notifications_telegram_bot_token' => 'notifications.telegram_bot_token',
        'notifications_telegram_chat_id' => 'notifications.telegram_chat_id',
    ];

    public function edit(Settings $settings, Tracker $tracker): Response
    {
        $secret = config('sattr.secret_settings');

        return Inertia::render('admin/settings', [
            // Secrets are never sent back to the browser; the form shows whether one is saved.
            'values' => collect(self::FIELDS)->map(fn (string $key) => in_array($key, $secret, true) ? '' : ($settings->get($key) ?? ''))->all(),
            'secrets_set' => collect(self::FIELDS)->filter(fn (string $key) => in_array($key, $secret, true))
                ->map(fn (string $key) => filled($settings->get($key)))->all(),
            'files' => [
                'instapay_qr' => $settings->url('instapay.qr_path'),
                'seo_og_image' => $settings->url('seo.og_image_path'),
            ],
            'server_drivers' => collect($tracker->enabledDrivers())->map(fn (TrackingDriver $driver) => $driver->name())->all(),
            'update_url' => route('admin.settings.update'),
        ]);
    }

    public function update(SettingsRequest $request, Settings $settings, SiteChrome $chrome): RedirectResponse
    {
        $data = $request->validated();
        $secret = config('sattr.secret_settings');
        $values = [];

        foreach (self::FIELDS as $field => $key) {
            if (! array_key_exists($field, $data)) {
                continue;
            }

            // A blank secret field means "keep what is saved".
            if (in_array($key, $secret, true) && blank($data[$field])) {
                continue;
            }

            $values[$key] = $data[$field];
        }

        foreach (['instapay_qr' => 'instapay.qr_path', 'seo_og_image' => 'seo.og_image_path'] as $field => $key) {
            if ($request->hasFile($field)) {
                if ($old = $settings->get($key)) {
                    Storage::disk('public')->delete($old);
                }

                $values[$key] = $request->file($field)->store('settings', 'public');
            }
        }

        $settings->put($values);
        $chrome->flush();

        return back()->with('success', 'Settings saved.');
    }
}
