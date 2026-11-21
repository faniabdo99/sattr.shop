<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Key/value site settings edited in the admin, with config/env fallbacks.
 */
class Settings
{
    private const CACHE_KEY = 'sattr.settings';

    /** @var array<string, mixed>|null */
    private ?array $loaded = null;

    public function get(string $key, mixed $default = null): mixed
    {
        $value = $this->stored()[$key] ?? null;

        if ($value === null || $value === '' || $value === []) {
            $value = config('sattr.defaults')[$key] ?? null;
        }

        return $value ?? $default;
    }

    /** A translatable setting ({ar, en}) resolved for a locale. */
    public function localized(string $key, ?string $locale = null): ?string
    {
        $value = $this->get($key);
        $locale ??= app()->getLocale();

        if (is_array($value)) {
            return $value[$locale] ?? $value[config('sattr.default_locale')] ?? null;
        }

        return $value;
    }

    /** Public URL of a file setting stored on the public disk. */
    public function url(string $key): ?string
    {
        $path = $this->get($key);

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        $keys = array_unique([...array_keys(config('sattr.defaults')), ...array_keys($this->stored())]);

        return collect($keys)->mapWithKeys(fn (string $key) => [$key => $this->get($key)])->all();
    }

    /** @param array<string, mixed> $values */
    public function put(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->flush();
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
        $this->loaded = null;
    }

    /** @return array<string, mixed> */
    private function stored(): array
    {
        return $this->loaded ??= Cache::rememberForever(
            self::CACHE_KEY,
            fn () => Setting::query()->pluck('value', 'key')->all(),
        );
    }
}
