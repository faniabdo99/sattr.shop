<?php

namespace App\Notifications;

use App\Services\Settings;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

/** Minimal Telegram bot channel: one sendMessage call, no SDK. */
class TelegramChannel
{
    public function __construct(private readonly Settings $settings) {}

    public function send(object $notifiable, Notification $notification): void
    {
        $token = $this->settings->get('notifications.telegram_bot_token');
        $chat = $this->settings->get('notifications.telegram_chat_id');

        if (! $token || ! $chat || ! method_exists($notification, 'toTelegram')) {
            return;
        }

        Http::timeout(8)->asForm()->post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chat,
            'text' => $notification->toTelegram($notifiable),
            'disable_web_page_preview' => true,
        ]);
    }
}
