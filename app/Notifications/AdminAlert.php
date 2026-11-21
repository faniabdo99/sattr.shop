<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Internal alert to the shop owner by email and, when configured, Telegram. */
class AdminAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /** @param list<string> $lines */
    public function __construct(
        public string $subject,
        public array $lines,
        public string $url,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        $channels = [TelegramChannel::class];

        if ($notifiable instanceof AnonymousNotifiable && $notifiable->routeNotificationFor('mail')) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)->subject($this->subject)->greeting($this->subject);

        foreach ($this->lines as $line) {
            $message->line($line);
        }

        return $message->action('Open in admin', $this->url);
    }

    public function toTelegram(object $notifiable): string
    {
        return implode("\n", [$this->subject, ...$this->lines, $this->url]);
    }
}
