<?php

use App\Rules\EgyptianMobile;
use App\Support\Money;

it('takes 10% off 849 EGP and rounds down to a whole pound', function () {
    expect(Money::discounted(84900, 10))->toBe(76400);
});

it('always rounds a discounted price down, never up', function (int $price, int $percent, int $expected) {
    expect(Money::discounted($price, $percent))->toBe($expected);
})->with([
    'no discount' => [84900, 0, 84900],
    '15% of 849 = 721.65' => [84900, 15, 72100],
    '10% of 999 = 899.1' => [99900, 10, 89900],
    '33% of 100 = 67' => [10000, 33, 6700],
    'full discount' => [84900, 100, 0],
]);

it('formats amounts for each language', function () {
    expect(Money::format(84900, 'en'))->toBe('849 EGP')
        ->and(Money::format(76400, 'ar'))->toBe('٧٦٤ ج.م')
        ->and(Money::decimal(84900))->toBe('849.00');
});

it('normalises phone numbers typed in common ways', function (string $input, string $expected) {
    expect(EgyptianMobile::normalise($input))->toBe($expected);
})->with([
    ['01012345678', '01012345678'],
    ['+20 101 234 5678', '01012345678'],
    ['00201012345678', '01012345678'],
    ['٠١٠١٢٣٤٥٦٧٨', '01012345678'],
    ['010-1234-5678', '01012345678'],
]);
