<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductImageStorage
{
    public static function usesCloudinary(): bool
    {
        return filled(config('cloudinary.cloud_url'));
    }

    public static function storeFromRequest(Request $request, string $field = 'image'): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        /** @var UploadedFile $file */
        $file = $request->file($field);

        if (self::usesCloudinary()) {
            $uploaded = $file->storeOnCloudinary('appifood/products');

            return $uploaded->getSecurePath();
        }

        return $file->store('products', 'public');
    }

    public static function delete(?string $image): void
    {
        if (!$image || MediaUrl::isRemote($image)) {
            return;
        }

        Storage::disk('public')->delete($image);
    }
}
