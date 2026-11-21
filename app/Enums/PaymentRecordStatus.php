<?php

namespace App\Enums;

/** State of a single proof submission in the payments table. */
enum PaymentRecordStatus: string
{
    case Submitted = 'submitted';
    case Verified = 'verified';
    case Rejected = 'rejected';
}
