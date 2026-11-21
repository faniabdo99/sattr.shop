<?php

namespace App\Console\Commands;

use App\Actions\Orders\FlagStaleInstaPayOrders;
use Illuminate\Console\Command;

class FlagStaleInstaPayOrdersCommand extends Command
{
    protected $signature = 'orders:flag-stale-instapay';

    protected $description = 'Flag InstaPay orders that are still unpaid after 24 hours';

    public function handle(FlagStaleInstaPayOrders $action): int
    {
        $this->info("Flagged {$action->handle()} order(s).");

        return self::SUCCESS;
    }
}
