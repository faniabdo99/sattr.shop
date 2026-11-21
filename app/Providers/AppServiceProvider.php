<?php

namespace App\Providers;

use App\Listeners\OrderEventSubscriber;
use App\Models\Article;
use App\Models\Design;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\Redirect;
use App\Models\Review;
use App\Models\User;
use App\Policies\AdminOnlyPolicy;
use App\Services\RedirectMap;
use App\Services\Settings;
use App\Services\SiteChrome;
use App\Services\Storefront;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Settings::class);
        $this->app->scoped(Storefront::class);
    }

    public function boot(): void
    {
        $this->configureDefaults();

        Event::subscribe(OrderEventSubscriber::class);

        Gate::define('admin', fn (User $user) => $user->is_admin);

        foreach ([Order::class, Product::class, Design::class, Page::class, Article::class, Review::class] as $model) {
            Gate::policy($model, AdminOnlyPolicy::class);
        }

        // Images and redirects also change what public pages show.
        $flush = fn () => DB::afterCommit(fn () => app(SiteChrome::class)->flush());
        Media::saved($flush);
        Media::deleted($flush);

        Redirect::saved(fn () => app(RedirectMap::class)->flush());
        Redirect::deleted(fn () => app(RedirectMap::class)->flush());
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
