<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'status_code' => 'integer', 'hits' => 'integer'];
    }

    public static function normalise(string $path): string
    {
        return '/'.trim(parse_url($path, PHP_URL_PATH) ?: $path, '/');
    }
}
