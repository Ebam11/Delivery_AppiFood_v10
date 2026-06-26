<?php

// Backend/app/Http/Controllers/API/Admin/ReviewManagementController.php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = Review::with(['user', 'restaurant'])
            ->filter()
            ->sort()
            ->getOrPaginate();

        return response()->json([
            'data' => $reviews,
            'meta' => $reviews instanceof \Illuminate\Pagination\LengthAwarePaginator ? [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'per_page'     => $reviews->perPage(),
                'total'        => $reviews->total(),
            ] : null
        ]);
    }

    public function toggleVisibility(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        if (!isset($review->is_visible)) {
            $review->update(['status' => $review->status === 'active' ? 'hidden' : 'active']);
            return response()->json([
                'message' => 'Review actualizada.',
                'status'  => $review->status
            ]);
        }

        $review->update(['is_visible' => !$review->is_visible]);

        return response()->json([
            'message'    => $review->is_visible ? 'Review visible.' : 'Review oculto.',
            'is_visible' => $review->is_visible
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review eliminada.']);
    }
}
