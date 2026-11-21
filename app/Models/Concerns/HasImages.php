<?php

namespace App\Models\Concerns;

use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Responsive WebP (made on upload) and AVIF (made on the queue) renditions
 * for every image attached to a model.
 */
trait HasImages
{
    use InteractsWithMedia;

    /** @var list<int> */
    public const IMAGE_WIDTHS = [480, 960, 1440, 1920];

    public function registerMediaConversions(?Media $media = null): void
    {
        foreach (self::IMAGE_WIDTHS as $width) {
            $this->addMediaConversion("webp-{$width}")
                ->fit(Fit::Max, $width, $width * 2)
                ->format('webp')
                ->quality(78)
                ->nonQueued();

            $this->addMediaConversion("avif-{$width}")
                ->fit(Fit::Max, $width, $width * 2)
                ->format('avif')
                ->quality(55)
                ->queued();
        }
    }
}
