<?php

use App\Models\Article;
use App\Models\Design;
use App\Models\Page;

beforeEach(function () {
    shop();
});

it('serves a sitemap index pointing at each section', function () {
    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/xml; charset=utf-8')
        ->assertSee('<sitemapindex', false)
        ->assertSee('https://sattr.test/sitemaps/pages.xml')
        ->assertSee('https://sattr.test/sitemaps/faculties.xml')
        ->assertSee('https://sattr.test/sitemaps/articles.xml')
        ->assertSee('https://sattr.test/sitemaps/images.xml');
});

it('lists pages in both languages with hreflang alternates', function () {
    $this->get('/sitemaps/pages.xml')
        ->assertOk()
        ->assertSee('<loc>https://sattr.test/ar</loc>', false)
        ->assertSee('<loc>https://sattr.test/en</loc>', false)
        ->assertSee('<loc>https://sattr.test/en/gift-pack</loc>', false)
        ->assertSee('hreflang="x-default"', false)
        ->assertDontSee('checkout');
});

it('lists published faculty pages and leaves out drafts and noindex pages', function () {
    $hidden = Design::factory()->create(['key' => 'law']);
    Page::factory()->faculty($hidden)->create(['slug' => ['ar' => 'حقوق', 'en' => 'law-student'], 'is_published' => false]);
    Page::factory()->create(['slug' => ['ar' => 'سر', 'en' => 'secret'], 'noindex' => true]);

    $this->get('/sitemaps/faculties.xml')
        ->assertSee('https://sattr.test/en/gifts/medical-student')
        ->assertDontSee('law-student');

    $this->get('/sitemaps/pages.xml')->assertDontSee('/en/secret');
});

it('lists published articles only', function () {
    Article::factory()->create(['slug' => ['ar' => 'منشور', 'en' => 'published-post']]);
    Article::factory()->draft()->create(['slug' => ['ar' => 'مسودة', 'en' => 'draft-post']]);

    $this->get('/sitemaps/articles.xml')
        ->assertSee('https://sattr.test/en/journal/published-post')
        ->assertDontSee('draft-post');
});

it('returns 404 for unknown sitemap sections', function () {
    $this->get('/sitemaps/orders.xml')->assertNotFound();
});

it('blocks crawlers outside production and points to the sitemap in production', function () {
    $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /');

    app()->detectEnvironment(fn () => 'production');

    $this->get('/robots.txt')
        ->assertSee('Disallow: /admin')
        ->assertSee('Sitemap: https://sattr.test/sitemap.xml');
});

it('serves Google and Meta product feeds with one item per design', function (string $path) {
    $this->get($path)
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<g:id>gift-pack-medical</g:id>', false)
        ->assertSee('<g:price>849.00 EGP</g:price>', false)
        ->assertSee('<g:availability>in stock</g:availability>', false)
        ->assertSee('<g:item_group_id>gift-pack</g:item_group_id>', false);
})->with(['/feeds/google.xml', '/feeds/meta.xml']);
