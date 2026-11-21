<?php

return [
    'status' => [
        'pending' => 'Received',
        'confirmed' => 'Confirmed',
        'processing' => 'Printing',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'returned' => 'Returned',
    ],
    'payment_status' => [
        'unpaid' => 'Unpaid',
        'awaiting_verification' => 'Awaiting verification',
        'paid' => 'Paid',
        'refunded' => 'Refunded',
    ],
    'payment_method' => [
        'instapay' => 'InstaPay',
        'cod' => 'Cash on delivery',
    ],
    'validation' => [
        'phone' => 'Enter an Egyptian mobile number: 11 digits starting with 010, 011, 012 or 015.',
        'design_sold_out' => 'That design has just sold out. Please choose another.',
        'not_enough_stock' => 'Only :count left in this design. Lower the quantity or choose another.',
        'turnstile' => 'We could not confirm you are human. Please try again.',
        'proof_required' => 'Upload the transfer screenshot or enter the reference number.',
        'throttled' => 'Too many orders from this device or number. Please try again in an hour, or message us on WhatsApp.',
    ],
    'mail' => [
        'customer_subject' => 'Your Sattr order :code',
        'customer_intro' => 'Thank you, :name. We have your order.',
        'customer_instapay' => 'To confirm it, transfer :amount by InstaPay and upload the screenshot from your order page.',
        'customer_cod' => 'You will pay :amount in cash on delivery.',
        'view_order' => 'View your order',
        'admin_subject' => 'New order :code (:method, :amount)',
        'proof_subject' => 'Payment proof uploaded for :code',
        'rejected_subject' => 'About your payment for order :code',
        'rejected_body' => 'We could not confirm your InstaPay transfer: :reason',
        'rejected_action' => 'Send the transfer again',
        'verified_subject' => 'Payment confirmed for order :code',
        'verified_body' => 'We received your payment of :amount. Your pack is now being prepared.',
        'review_subject' => 'How was your Sattr pack?',
        'review_body' => 'Your order :code was delivered. A short review helps the next person choosing a gift.',
        'review_action' => 'Write a review',
        'signature' => 'Sattr',
    ],
];
