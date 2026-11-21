<?php

namespace App\Services\Tracking;

interface TrackingDriver
{
    public function name(): string;

    /** True only when this provider's credentials are configured. */
    public function enabled(): bool;

    /**
     * @param  array<string, mixed>  $payload  see Tracker::payload()
     */
    public function send(string $event, array $payload): void;
}
