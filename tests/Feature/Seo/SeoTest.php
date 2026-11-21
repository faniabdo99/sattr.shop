<?php

use App\Models\Article;
use App\Models\Design;
use App\Models\Page;
use App\Models\Redirect;
use Illuminate\Http\Request;
use Illuminate\Testing\TestResponse;

/** @return list<array<string, mixed>> */
function schemaOf(TestResponse $response): array
{
    preg_match('#<script type="application/ld\+json" data-seo="schema">(.*?)</script>#s', $response->getContent(), $matches);

    expect($matches)->not->toBeEmpty();

    return json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
}

/** @return list<string> */
function schemaTypes(TestResponse $response): array
{
    return array_column(schemaOf($response), '@type');
}

beforeEach(function () {
    shop();
});

it('redirects the root by Accept-Language and defaults to Arabic', function () {
    $this->withHeader('Accept-Language', '')->get('/')->assertRedirect('https://sattr.test/ar');
    $this->withHeader('Accept-Language', 'en-GB,en;q=0.9')->get('/')->assertRedirect('https://sattr.test/en');
    $this->withHeader('Accept-Language', 'fr-FR')->get('/')->assertRedirect('https://sattr.test/ar');
});

it('renders the head for each public page', function (string $path, string $title) {
    $response = $this->get($path)->assertOk();
    $html = $response->getContent();

    expect(substr_count($html, '<title'))->toBe(1);

    $response->assertSee('<title data-seo="title">'.e($title), false)
        ->assertSee('<meta name="description" content="', false)
        ->assertSee('<link rel="canonical" href="https://sattr.test'.str_replace(' ', '%20', $path).'"', false)
        ->assertSee('hreflang="ar"', false)
        ->assertSee('hreflang="en"', false)
        ->assertSee('hreflang="x-default"', false)
        ->assertSee('content="index, follow', false)
        ->assertSee('property="og:title"', false);
})->with([
    'home (en)' => ['/en', 'Sattr — Desk Essentials'],
    'product (en)' => ['/en/gift-pack', 'Gift Pack | Sattr'],
    'faculty (en)' => ['/en/gifts/medical-student', 'A gift for the medical student | Sattr'],
    'home (ar)' => ['/ar', 'سطر — أساسيات المكتب'],
    'product (ar)' => ['/ar/gift-pack', 'طقم هدايا | سطر'],
]);

it('sets lang and dir on the document', function () {
    $this->get('/ar')->assertSee('<html lang="ar" dir="rtl">', false);
    $this->get('/en')->assertSee('<html lang="en" dir="ltr">', false);
});

it('links each page to its translation with its own slug', function () {
    $this->get('/en/gifts/medical-student')
        ->assertSee('hreflang="ar" href="https://sattr.test/ar/gifts/'.rawurlencode('هدايا-طلاب-الطب').'"', false);

    $this->get('/ar/gifts/'.rawurlencode('هدايا-طلاب-الطب'))->assertOk()
        ->assertSee('hreflang="en" href="https://sattr.test/en/gifts/medical-student"', false);

    // A slug only resolves in its own language.
    $this->get('/ar/gifts/medical-student')->assertNotFound();
});

it('puts Organization, WebSite, Product and FAQPage data on the home page', function () {
    $response = $this->get('/en');

    expect(schemaTypes($response))->toBe(['Organization', 'WebSite', 'Product', 'FAQPage']);

    $schema = collect(schemaOf($response))->keyBy('@type');

    expect($schema['WebSite']['potentialAction']['@type'])->toBe('SearchAction')
        ->and($schema['Product']['offers']['price'])->toBe('849.00')
        ->and($schema['Product']['offers']['priceCurrency'])->toBe('EGP')
        ->and($schema['Product']['offers']['availability'])->toBe('https://schema.org/InStock')
        ->and($schema['Product']['offers']['shippingDetails']['shippingRate']['value'])->toBe('0')
        ->and($schema['Product']['offers']['hasMerchantReturnPolicy']['merchantReturnDays'])->toBe(14)
        ->and($schema['Product'])->not->toHaveKey('aggregateRating')
        ->and($schema['FAQPage']['mainEntity'])->toHaveCount(1);
});

it('puts Product and BreadcrumbList data on product and faculty pages', function () {
    expect(schemaTypes($this->get('/en/gift-pack')))->toBe(['Product', 'FAQPage', 'BreadcrumbList']);

    $faculty = collect(schemaOf($this->get('/en/gifts/medical-student')))->keyBy('@type');

    expect($faculty->keys()->all())->toBe(['Product', 'BreadcrumbList'])
        ->and($faculty['Product']['name'])->toContain('Medical')
        ->and($faculty['Product']['offers']['url'])->toBe('https://sattr.test/en/gifts/medical-student')
        ->and($faculty['BreadcrumbList']['itemListElement'])->toHaveCount(3);
});

it('reports a sold-out design as out of stock', function () {
    Design::query()->update(['stock' => 0]);

    $schema = collect(schemaOf($this->get('/en/gifts/medical-student')))->keyBy('@type');

    expect($schema['Product']['offers']['availability'])->toBe('https://schema.org/OutOfStock');
});

it('puts BlogPosting data on articles and hides drafts', function () {
    $article = Article::factory()->create(['slug' => ['ar' => 'مقال', 'en' => 'graduation-gifts'], 'title' => ['ar' => 'مقال', 'en' => 'Graduation gifts']]);
    Article::factory()->draft()->create(['slug' => ['ar' => 'مسودة', 'en' => 'draft-post']]);

    $response = $this->get('/en/journal/graduation-gifts')->assertOk();

    expect(schemaTypes($response))->toBe(['BlogPosting', 'BreadcrumbList']);
    $response->assertSee('<meta property="og:type" content="article"', false);

    $this->get('/en/journal/draft-post')->assertNotFound();
    $this->get('/en/journal')->assertOk()->assertInertia(fn ($page) => $page->has('articles', 1));
    expect($article->reading_minutes)->toBe(1);
});

it('uses admin SEO fields over the automatic defaults', function () {
    $page = Page::factory()->create([
        'slug' => ['ar' => 'عن', 'en' => 'about'],
        'meta_title' => ['en' => 'Custom title'],
        'meta_description' => ['en' => 'Custom description'],
        'canonical_url' => 'https://example.com/canonical',
        'noindex' => true,
    ]);

    $this->get('/en/about')->assertOk()
        ->assertSee('<title data-seo="title">Custom title</title>', false)
        ->assertSee('content="Custom description"', false)
        ->assertSee('<link rel="canonical" href="https://example.com/canonical"', false)
        ->assertSee('content="noindex, follow"', false);

    // Arabic has no override, so it falls back to the page title.
    $this->get('/ar/'.rawurlencode('عن'))->assertSee($page->getTranslation('title', 'ar').' | سطر');
});

it('keeps checkout and order pages out of the index', function () {
    $this->get('/en/checkout')->assertOk()->assertSee('content="noindex, follow"', false);
});

it('serves a helpful 404 with suggestions', function () {
    $this->get('/en/no-such-page')
        ->assertNotFound()
        ->assertSee('content="noindex, follow"', false)
        ->assertInertia(fn ($page) => $page->component('site/not-found')->has('faculties', 1));

    $this->get('/de/whatever')->assertNotFound();
});

it('removes trailing slashes with a permanent redirect', function () {
    // Built by hand: the test client strips trailing slashes before sending.
    $visit = fn (string $uri) => app()->handle(Request::create('https://sattr.test'.$uri));

    $response = $visit('/en/gift-pack/');
    expect($response->getStatusCode())->toBe(301)
        ->and($response->headers->get('Location'))->toBe('https://sattr.test/en/gift-pack');

    $withQuery = $visit('/en/journal/?q=gift');
    expect($withQuery->getStatusCode())->toBe(301)
        ->and($withQuery->headers->get('Location'))->toBe('https://sattr.test/en/journal?q=gift');
});

it('applies redirects managed in the admin', function () {
    $this->actingAs(admin())->post('/admin/redirects', [
        'from_path' => '/en/old-gift-page/',
        'to_url' => '/en/gift-pack',
        'status_code' => 301,
        'is_active' => true,
    ])->assertSessionHasNoErrors();

    $this->get('/en/old-gift-page')->assertStatus(301)->assertRedirect('/en/gift-pack');

    expect(Redirect::query()->sole()->hits)->toBe(1);

    Redirect::query()->sole()->update(['is_active' => false]);

    $this->get('/en/old-gift-page')->assertNotFound();
});

it('shares no signed-in user data on public pages', function () {
    $this->actingAs(admin())->get('/en')->assertInertia(fn ($page) => $page->where('auth.user', null));
});
