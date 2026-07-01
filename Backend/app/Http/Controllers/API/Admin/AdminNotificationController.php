<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminNotificationController extends Controller
{
    /**
     * Envía una notificación masiva a un grupo de usuarios según el target.
     * Targets soportados: all, clients, restaurants, premium, drivers
     */
    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target'  => 'required|string|in:all,clients,restaurants,premium,drivers',
            'title'   => 'required|string|max:150',
            'message' => 'required|string|max:1000',
        ]);

        $query = User::query()->where('status', true);

        match ($validated['target']) {
            'clients'     => $query->where('role', UserRole::USER->value),
            'restaurants' => $query->where('role', UserRole::RESTAURANT->value),
            'premium'     => $query->where('is_premium', true),
            'drivers'     => $query->where('role', UserRole::DRIVER->value),
            default       => null, // 'all' → sin filtro adicional
        };

        $userIds = $query->pluck('id');

        if ($userIds->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron usuarios para el grupo seleccionado.',
                'sent_to' => 0,
            ], 200);
        }

        $now  = now();
        $rows = $userIds->map(fn ($uid) => [
            'user_id'    => $uid,
            'title'      => $validated['title'],
            'message'    => $validated['message'],
            'type'       => 'broadcast',
            'data'       => json_encode([
                'target'    => $validated['target'],
                'sent_by'   => $request->user()->id,
                'sent_by_name' => $request->user()->name,
            ]),
            'is_read'    => false,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        // Insert por chunks para no saturar la BD con miles de rows
        collect($rows)->chunk(500)->each(
            fn ($chunk) => DB::table('notifications')->insert($chunk->toArray())
        );

        return response()->json([
            'message' => 'Notificación enviada correctamente.',
            'sent_to' => $userIds->count(),
            'target'  => $validated['target'],
        ]);
    }

    /**
     * Historial de notificaciones broadcast enviadas (agrupadas por título + mensaje).
     */
    public function history(Request $request): JsonResponse
    {
        $history = DB::table('notifications')
            ->where('type', 'broadcast')
            ->select(
                'title',
                'message',
                DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.target')) as target"),
                DB::raw("JSON_UNQUOTE(JSON_EXTRACT(data, '$.sent_by_name')) as sent_by_name"),
                DB::raw('COUNT(*) as total_sent'),
                DB::raw('MIN(created_at) as sent_at'),
            )
            ->groupBy('title', 'message', 'data')
            ->orderByDesc('sent_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => $history]);
    }
}
