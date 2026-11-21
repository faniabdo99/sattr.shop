<?php

namespace App\Services\Tracking\Drivers;

use App\Services\Settings;
use App\Services\Tracking\TrackingDriver;
use Illuminate\Support\Facades\Http;

class PostHogDriver implements TrackingDriver
{
    public function __construct(private readonly Settings $settings) {}

    public function name(): string
    {
        return 'posthog';
    }

    public function enabled(): bool
    {
        return filled($this->settings->get('tracking.posthog_key'));
    }

    public function send(string $event, array $payload): void
    {
        Http::timeout(8)
            ->post(rtrim((string) $this->settings->get('tracking.posthog_host'), '/').'/capture/', [
                'api_key' => $this->settings->get('tracking.posthog_key'),
                'event' => $event,
                'distinct_id' => $payload['client']['distinct_id'],
                'properties' => array_filter([
                    'transaction_id' => $payload['transaction_id'],
                    'currency' => $payload['currency'],
                    'value' => $payload['value'],
                    'payment_type' => $payload['payment_type'],
                    'items' => $payload['items'],
                    ...$payload['order'],
                    '$insert_id' => $payload['event_id'],
                    '$session_id' => $payload['client']['session_id'],
                    '$current_url' => $payload['source_url'],
                    // Nothing that identifies the customer: no name, phone or email.
                    '$set' => $payload['client']['known_visitor'] ? array_filter([
                        'governorate' => $payload['order']['governorate'],
                        'locale' => $payload['order']['locale'],
                        'last_payment_type' => $payload['payment_type'],
                    ]) : null,
                    '$process_person_profile' => $payload['client']['known_visitor'] ? null : false,
                ], fn ($value) => $value !== null),
            ])
            ->throw();
    }
}
