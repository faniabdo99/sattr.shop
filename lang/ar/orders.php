<?php

return [
    'status' => [
        'pending' => 'تم الاستلام',
        'confirmed' => 'تم التأكيد',
        'processing' => 'قيد الطباعة',
        'shipped' => 'تم الشحن',
        'delivered' => 'تم التسليم',
        'cancelled' => 'ملغي',
        'returned' => 'مرتجع',
    ],
    'payment_status' => [
        'unpaid' => 'غير مدفوع',
        'awaiting_verification' => 'في انتظار التأكيد',
        'paid' => 'مدفوع',
        'refunded' => 'تم رد المبلغ',
    ],
    'payment_method' => [
        'instapay' => 'إنستاباي',
        'cod' => 'الدفع عند الاستلام',
    ],
    'validation' => [
        'phone' => 'اكتب رقم موبايل مصري: 11 رقماً تبدأ بـ 010 أو 011 أو 012 أو 015.',
        'design_sold_out' => 'نفدت كمية هذا التصميم للتو. برجاء اختيار تصميم آخر.',
        'not_enough_stock' => 'باقي :count فقط من هذا التصميم. قلّل الكمية أو اختر تصميماً آخر.',
        'turnstile' => 'لم نتمكن من التحقق. برجاء المحاولة مرة أخرى.',
        'proof_required' => 'ارفع صورة إيصال التحويل أو اكتب رقم العملية.',
        'throttled' => 'طلبات كثيرة من هذا الجهاز أو الرقم. حاول بعد ساعة أو راسلنا على واتساب.',
    ],
    'mail' => [
        'customer_subject' => 'طلبك من سطر :code',
        'customer_intro' => 'شكراً لك، :name. استلمنا طلبك.',
        'customer_instapay' => 'لتأكيده، حوّل :amount بإنستاباي وارفع صورة الإيصال من صفحة طلبك.',
        'customer_cod' => 'ستدفع :amount نقداً عند الاستلام.',
        'view_order' => 'عرض الطلب',
        'admin_subject' => 'طلب جديد :code (:method، :amount)',
        'proof_subject' => 'تم رفع إثبات الدفع للطلب :code',
        'rejected_subject' => 'بخصوص دفع الطلب :code',
        'rejected_body' => 'لم نتمكن من تأكيد تحويل إنستاباي: :reason',
        'rejected_action' => 'أرسل التحويل مرة أخرى',
        'verified_subject' => 'تم تأكيد الدفع للطلب :code',
        'verified_body' => 'استلمنا مبلغ :amount. جارٍ تجهيز طقمك الآن.',
        'review_subject' => 'كيف كان طقم سطر؟',
        'review_body' => 'تم تسليم طلبك :code. تقييم قصير يساعد من يختار هديته بعدك.',
        'review_action' => 'اكتب تقييماً',
        'signature' => 'سطر',
    ],
];
