<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $lines = app()->isProduction()
            ? [
                'User-agent: *',
                'Disallow: /admin',
                'Disallow: /settings',
                'Disallow: /login',
                'Disallow: /*/checkout',
                'Disallow: /*/order/',
                'Disallow: /*/review/',
                '',
                'Sitemap: '.route('sitemap.index'),
            ]
            : ['User-agent: *', 'Disallow: /'];

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
