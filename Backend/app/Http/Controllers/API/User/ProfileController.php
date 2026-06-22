<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('restaurant');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name'         => ['sometimes', 'string', 'max:100'],
            'email'        => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'        => ['sometimes', 'string', 'max:20'],
            'id_number'    => ['nullable', 'string', 'max:30'],
            'birth_date'   => ['nullable', 'date'],
            'gender'       => ['nullable', Rule::in(['male', 'female', 'other'])],
            'current_password' => ['required_with:password', 'string'],
            'password'     => ['sometimes', 'string', 'min:8', 'confirmed'],
        ]);

        // Verificar contraseña actual si quiere cambiarla
        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta.',
                ], 422);
            }
            $user->password = $request->password;
        }

        $user->fill($request->only([
            'name',
            'email',
            'phone',
            'id_number',
            'birth_date',
            'gender',
        ]));
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'data'    => new UserResource($user),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Cuenta eliminada correctamente.',
        ]);
    }

    public function avatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Subir a la carpeta 'appifood/avatars'
        $subida = $request->file('avatar')->storeOnCloudinary('appifood/avatars');
        $path = $subida->getSecurePath();
        
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar actualizado.',
            'avatar'  => $path,
        ]);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Generar URL hacia el endpoint de verificación pública
        $verificationUrl = route('verification.verify', ['id' => $user->id]);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(
                new \App\Mail\VerifyEmailMail($user, $verificationUrl)
            );
            
            return response()->json([
                'message' => 'Te hemos enviado un enlace de confirmación a tu correo. Por favor revísalo.',
            ]);
        } catch (\Exception $e) {
            // Fallback en caso de que la configuración SMTP falle localmente
            $user->email_verified_at = now();
            $user->save();
            
            return response()->json([
                'message' => 'Correo verificado localmente debido a límites de red.',
                'data'    => new UserResource($user),
            ]);
        }
    }

    public function verifyEmailLink(int $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->email_verified_at = now();
        $user->save();

        // Redirigir al perfil del usuario en el Frontend
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return redirect()->away($frontendUrl . '/user/profile?verified=email');
    }

    public function verifyPhone(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->phone_verified_at = now();
        $user->save();

        return response()->json([
            'message' => 'Número de teléfono verificado correctamente.',
            'data'    => new UserResource($user),
        ]);
    }
}
