<?php

namespace App\Jobs;

use App\Services\Tracking\TrackingDriver;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendTrackingEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    /**
     * @param  class-string<TrackingDriver>  $driver
     * @param  array<string, mixed>  $payload
     */
    public function __construct(public string $driver, public string $event, public array $payload) {}

    public function handle(): void
    {
        $driver = app($this->driver);

        if ($driver->enabled()) {
            $driver->send($this->event, $this->payload);
        }
    }
}
