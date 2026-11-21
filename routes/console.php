<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:flag-stale-instapay')->hourly()->withoutOverlapping();
Schedule::command('horizon:snapshot')->everyFiveMinutes();
