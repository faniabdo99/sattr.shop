<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** A short transactional email to the customer, in the order's language. */
class CustomerMessage extends Notification implements ShouldQueue
{
    use Queueable;

    /** @param list<string> $lines */
    public function __construct(
        public string $subject,
        public array $lines,
        public string $actionText,
        public string $actionUrl,
        string $locale,
    ) {
        $this->locale($locale);
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)->subject($this->subject)->greeting($this->subject);

        foreach ($this->lines as $line) {
            $message->line($line);
        }

        return $message
            ->action($this->actionText, $this->actionUrl)
            ->salutation(__('orders.mail.signature', [], $this->locale));
    }
}
