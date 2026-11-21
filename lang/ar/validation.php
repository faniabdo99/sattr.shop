<?php

/* Arabic messages for the validation rules the storefront uses. */
return [
    'required' => 'حقل :attribute مطلوب.',
    'required_without' => 'حقل :attribute مطلوب.',
    'string' => 'حقل :attribute يجب أن يكون نصاً.',
    'integer' => 'حقل :attribute يجب أن يكون رقماً صحيحاً.',
    'email' => 'اكتب بريداً إلكترونياً صحيحاً.',
    'in' => 'القيمة المختارة في :attribute غير صحيحة.',
    'enum' => 'القيمة المختارة في :attribute غير صحيحة.',
    'exists' => 'القيمة المختارة في :attribute غير صحيحة.',
    'different' => ':attribute يجب أن يختلف عن :other.',
    'image' => ':attribute يجب أن يكون صورة.',
    'mimes' => ':attribute يجب أن يكون ملفاً من نوع: :values.',
    'uploaded' => 'تعذر رفع :attribute. حاول مرة أخرى.',
    'min' => [
        'numeric' => ':attribute يجب ألا يقل عن :min.',
        'string' => ':attribute يجب ألا يقل عن :min أحرف.',
        'file' => ':attribute يجب ألا يقل عن :min كيلوبايت.',
    ],
    'max' => [
        'numeric' => ':attribute يجب ألا يزيد عن :max.',
        'string' => ':attribute يجب ألا يزيد عن :max حرفاً.',
        'file' => ':attribute يجب ألا يزيد حجمه عن :max كيلوبايت.',
    ],
    'attributes' => [
        'design' => 'تصميم الكلية',
        'cover_name' => 'الاسم على الغلاف',
        'gift_message' => 'بطاقة الرسالة',
        'payment_method' => 'طريقة الدفع',
        'phone' => 'رقم الموبايل',
    ],
];
