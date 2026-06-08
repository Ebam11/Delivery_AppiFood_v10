<?php

namespace App\Http\Controllers\API\V1\Auth;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use App\Services\LogService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @group Authentication V1
 *
 * Endpoints for user authentication (Login, Register, Token Management)
 *
 * @subgroup User Login
 */
class LoginController extends Controller
{
    use ApiResponse;

    /**
     * User Login
     *
     * Authenticate user and return access_token + refresh_token
     *
     * @authenticated false
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "access_token": "token_string",
     *     "refresh_token": "token_string",
     *     "expires_in": 3600,
     *     "type": "Bearer"
     *   }
     * }
     * @response 401 {
     *   "success": false,
     *   "message": "Invalid credentials"
     * }
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            LogService::warning('Failed login attempt', [
                'email' => $validated['email'],
                'ip' => $request->ip()
            ]);
            return $this->error('Invalid credentials', 401);
        }

        // Generate access token (Sanctum)
        $accessToken = $user->createToken('api-token')->plainTextToken;

        // Generate refresh token
        $refreshToken = Str::random(128);

        // Store hash of refresh token
        $user->update([
            'refresh_token_hash' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_login_at' => now(),
        ]);

        LogService::logAction('user_login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip()
        ]);

        return $this->success([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => 3600,
            'type' => 'Bearer'
        ]);
    }
}
