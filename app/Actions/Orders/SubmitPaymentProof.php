<?php

namespace App\Actions\Orders;

use App\Enums\PaymentRecordStatus;
use App\Enums\PaymentStatus;
use App\Events\PaymentProofSubmitted;
use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class SubmitPaymentProof
{
    public function handle(Order $order, ?UploadedFile $proof, ?string $reference): Order
    {
        // Proofs are private: stored on the local disk and served only to admins.
        $path = $proof?->store("payment-proofs/{$order->code}", 'local');

        DB::transaction(function () use ($order, $path, $reference) {
            $order->payments()->create([
                'method' => $order->payment_method,
                'amount' => $order->total,
                'status' => PaymentRecordStatus::Submitted,
                'proof_path' => $path,
                'reference' => $reference,
            ]);

            $order->update([
                'payment_status' => PaymentStatus::AwaitingVerification,
                'payment_proof_path' => $path ?? $order->payment_proof_path,
                'payment_reference' => $reference ?? $order->payment_reference,
                'payment_flagged_at' => null,
            ]);
        });

        PaymentProofSubmitted::dispatch($order);

        return $order;
    }
}
