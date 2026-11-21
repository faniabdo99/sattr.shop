<?php

namespace App\Support;

use App\Models\Order;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/** Shapes models for the admin UI (always English, all translations included). */
final class AdminPresent
{
    /** @return array<string, mixed> */
    public static function media(Media $media): array
    {
        return [
            'id' => $media->id,
            'url' => $media->getUrl(),
            'thumb' => $media->hasGeneratedConversion('webp-480') ? $media->getUrl('webp-480') : $media->getUrl(),
            'alt' => $media->getCustomProperty('alt') ?? ['ar' => '', 'en' => ''],
            'collection' => $media->collection_name,
        ];
    }

    /**
     * @param  list<string>  $collections
     * @return array<string, list<array<string, mixed>>>
     */
    public static function mediaFor(HasMedia $model, array $collections): array
    {
        return collect($collections)->mapWithKeys(fn (string $collection) => [
            $collection => $model->getMedia($collection)->map(fn (Media $media) => self::media($media))->values()->all(),
        ])->all();
    }

    /** @return array<string, mixed> */
    public static function orderRow(Order $order): array
    {
        $item = $order->items->first();

        return [
            'id' => $order->id,
            'code' => $order->code,
            'created_at' => $order->created_at?->timezone('Africa/Cairo')->format('d M Y, H:i'),
            'customer_name' => $order->customer_name,
            'phone' => $order->phone,
            'governorate' => config("egypt.governorates.{$order->governorate}.en", $order->governorate),
            'design' => $item?->design_name,
            'quantity' => $item?->quantity,
            'status' => $order->status->value,
            'status_label' => $order->status->label('en'),
            'payment_method' => $order->payment_method->value,
            'payment_method_label' => $order->payment_method->label('en'),
            'payment_status' => $order->payment_status->value,
            'payment_status_label' => $order->payment_status->label('en'),
            'total_label' => Money::format($order->total, 'en'),
            'flagged' => $order->payment_flagged_at !== null,
            'source' => $order->utm_source,
            'url' => route('admin.orders.show', $order),
        ];
    }

    /** @return list<array{value: string, label: string}> */
    public static function options(string $enum): array
    {
        return collect($enum::cases())->map(fn ($case) => ['value' => $case->value, 'label' => $case->label('en')])->all();
    }
}
