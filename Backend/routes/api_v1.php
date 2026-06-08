<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\Auth\LoginController as V1LoginController;
use App\Http\Controllers\API\V1\Auth\RegisterController as V1RegisterController;
use App\Http\Controllers\API\V1\Auth\RefreshTokenController as V1RefreshTokenController;
use App\Http\Controllers\API\V1\Users\UserController as V1UserController;
use App\Http\Controllers\API\V1\Orders\OrderController as V1OrderController;
use App\Http\Controllers\API\V1\Restaurants\RestaurantController as V1RestaurantController;
use App\Http\Controllers\API\V1\Products\ProductController as V1ProductController;
use App\Http\Controllers\API\V1\Admin\UserManagementController as V1AdminUserController;
use App\Http\Controllers\API\V1\Admin\RestaurantManagementController as V1AdminRestaurantController;

// API V1 Routes
Route::prefix('v1')->group(function () {

    // Public Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [V1LoginController::class, 'login']);
        Route::post('/register', [V1RegisterController::class, 'register']);
        Route::post('/refresh', [V1RefreshTokenController::class, 'refresh']);
        Route::post('/forgot-password', 'PasswordResetController@sendResetLink');
        Route::post('/reset-password', 'PasswordResetController@resetPassword');

        Route::get('/google', 'GoogleAuthController@redirectToGoogle');
        Route::get('/google/callback', 'GoogleAuthController@handleGoogleCallback');
    });

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', 'LogoutController@logout');
        Route::post('/auth/revoke', [V1RefreshTokenController::class, 'revoke']);

        // User Profile
        Route::prefix('users')->group(function () {
            Route::get('/me', [V1UserController::class, 'show']);
            Route::put('/me', [V1UserController::class, 'update']);
            Route::post('/me/avatar', [V1UserController::class, 'updateAvatar']);
            Route::delete('/me', [V1UserController::class, 'destroy']);
        });

        // Orders
        Route::apiResource('orders', V1OrderController::class);

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', 'NotificationController@index');
            Route::patch('/{id}/read', 'NotificationController@markRead');
            Route::patch('/read-all', 'NotificationController@markAllRead');
            Route::delete('/{id}', 'NotificationController@destroy');
        });

        // Restaurants (User View)
        Route::prefix('restaurants')->group(function () {
            Route::get('/', [V1RestaurantController::class, 'index']);
            Route::get('/{id}', [V1RestaurantController::class, 'show']);
            Route::get('/{id}/reviews', 'ReviewController@indexPublic');
        });

        // Products
        Route::apiResource('products', V1ProductController::class)->only(['index', 'show']);

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/', 'CartController@show');
            Route::post('/add', 'CartController@add');
            Route::put('/update/{item_id}', 'CartController@update');
            Route::delete('/remove/{item_id}', 'CartController@remove');
            Route::delete('/clear', 'CartController@clear');
        });

        // Addresses
        Route::apiResource('addresses', 'AddressController');

        // Payments
        Route::prefix('payments')->group(function () {
            Route::get('/methods', 'PaymentController@methods');
            Route::post('/', 'PaymentController@store');
            Route::post('/confirm', 'PaymentController@confirm');
        });

        // Upload
        Route::post('/upload', 'UploadController@store');
    });

    // Admin Routes
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::apiResource('users', V1AdminUserController::class);
        Route::apiResource('restaurants', V1AdminRestaurantController::class);
        Route::apiResource('categories', 'Admin\CategoryController');
        Route::apiResource('coupons', 'Admin\CouponController');
        Route::get('/dashboard', 'Admin\DashboardController@index');
        Route::get('/reports', 'Admin\ReportController@index');
    });

    // Restaurant Routes
    Route::middleware(['auth:sanctum', 'role:restaurant'])->prefix('restaurant')->group(function () {
        Route::apiResource('orders', 'Restaurant\OrderManagementController');
        Route::apiResource('products', 'Restaurant\ProductController');
        Route::apiResource('categories', 'Restaurant\CategoryController');
        Route::get('/dashboard', 'Restaurant\DashboardController@index');
        Route::put('/profile', 'Restaurant\ProfileRestaurantController@update');
        Route::get('/profile', 'Restaurant\ProfileRestaurantController@show');
        Route::get('/reviews', 'Restaurant\ReviewManagementController@index');
        Route::post('/reviews/{id}/reply', 'Restaurant\ReviewManagementController@reply');
    });
});

// Health Check (No versioning needed)
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'appifood-backend']));

// Public endpoints
Route::get('/restaurants', 'RestaurantController@index');
Route::get('/subscription-plans', 'SubscriptionPlanController@index');
Route::post('/support/chat', 'SupportAssistantController@store')->middleware('throttle:20,1');
