<?php

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Faq> */
class FaqFactory extends Factory
{
    public function definition(): array
    {
        return [
            'question' => ['ar' => 'سؤال؟', 'en' => 'Question?'],
            'answer' => ['ar' => 'إجابة.', 'en' => 'Answer.'],
            'sort' => 0,
            'is_active' => true,
        ];
    }
}
