<?php

namespace App\Http\Controllers\API\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'folder' => ['nullable', 'string', 'in:products,restaurants,avatars,banners'],
        ]);

        $folder = $request->folder ?? 'general';
        $path   = $request->file('file')->store($folder, 'public');

        return response()->json([
            'message' => 'Archivo subido correctamente.',
            'path'    => $path,
            'url'     => asset('storage/' . $path),
        ]);
    }
}