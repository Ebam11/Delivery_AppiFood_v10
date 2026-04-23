<?php

use App\Http\Controllers\API\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\API\Admin\CouponController;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\API\Admin\OrderMonitorController;
use App\Http\Controllers\API\Admin\ReportController;
use App\Http\Controllers\API\Admin\RestaurantManagementController;
use App\Http\Controllers\API\Admin\UserManagementController;
use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\PasswordResetController;
use App\Http\Controllers\API\Auth\LogoutController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Restaurant\CategoryController;
use App\Http\Controllers\API\Restaurant\DashboardController as RestaurantDashboard;
use App\Http\Controllers\API\Restaurant\OrderManagementController;
use App\Http\Controllers\API\Restaurant\ProductController;
use App\Http\Controllers\API\Restaurant\ProfileRestaurantController;
use App\Http\Controllers\API\Shared\NotificationController;
use App\Http\Controllers\API\User\PaymentController;
use App\Http\Controllers\API\Shared\SupportAssistantController;
use App\Http\Controllers\API\Shared\UploadController;
use App\Http\Controllers\API\User\AddressController;
use App\Http\Controllers\API\User\CartController;
use App\Http\Controllers\API\User\OrderController;
use App\Http\Controllers\API\User\FavoriteController;
use App\Http\Controllers\API\User\ProfileController;
use App\Http\Controllers\API\User\UserPaymentMethodController;
use App\Http\Controllers\API\User\RestaurantController;
use App\Http\Controllers\API\User\ReviewController;
use Illuminate\Support\Facades\Route;

// Endpoints publicos.
Route::prefix('auth')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{id}/reviews', [ReviewController::class, 'indexPublic']);
Route::post('/support/chat', SupportAssistantController::class)->middleware('throttle:20,1');

// Endpoints protegidos.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', LogoutController::class);
    Route::get('/profile', [ProfileController::class, 'show']);

    // Funciones compartidas para usuarios autenticados.
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{id}/read', [NotificationController::class, 'markRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    Route::post('/upload', UploadController::class);

    // Endpoints para rol:user.
    Route::middleware('role:user')->group(function () {
        Route::prefix('payments')->group(function () {
            Route::get('/methods', [PaymentController::class, 'methods']);
            Route::post('/', [PaymentController::class, 'store']);
            Route::post('/confirm', [PaymentController::class, 'confirm']);
        });

        Route::prefix('payment-methods')->group(function () {
            Route::get('/', [UserPaymentMethodController::class, 'index']);
            Route::post('/', [UserPaymentMethodController::class, 'store']);
            Route::put('/{id}', [UserPaymentMethodController::class, 'update']);
            Route::delete('/{id}', [UserPaymentMethodController::class, 'destroy']);
        });

        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::delete('/', [ProfileController::class, 'destroy']);
            Route::post('/avatar', [ProfileController::class, 'avatar']);
        });

        Route::prefix('addresses')->group(function () {
            Route::get('/', [AddressController::class, 'index']);
            Route::get('/{id}', [AddressController::class, 'show']);
            Route::post('/', [AddressController::class, 'store']);
            Route::put('/{id}', [AddressController::class, 'update']);
            Route::delete('/{id}', [AddressController::class, 'destroy']);
            Route::patch('/{id}/default', [AddressController::class, 'setDefault']);
        });

        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/items', [CartController::class, 'addItem']);
            Route::put('/items/{id}', [CartController::class, 'updateItem']);
            Route::delete('/items/{id}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clear']);
        });

        Route::prefix('favorites')->group(function () {
            Route::get('/', [FavoriteController::class, 'index']);
            Route::post('/toggle', [FavoriteController::class, 'toggle']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::post('/', [OrderController::class, 'store']);
            Route::get('/{id}', [OrderController::class, 'show']);
            Route::patch('/{id}/cancel', [OrderController::class, 'cancel']);
        });

        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    });

    // Endpoints para rol:restaurant.
    Route::middleware('role:restaurant')->prefix('restaurant')->group(function () {
        Route::get('/dashboard', RestaurantDashboard::class);

        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileRestaurantController::class, 'show']);
            Route::put('/', [ProfileRestaurantController::class, 'update']);
            Route::post('/logo', [ProfileRestaurantController::class, 'logo']);
        });

        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
            Route::patch('/reorder', [CategoryController::class, 'reorder']);
        });

        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'index']);
            Route::post('/', [ProductController::class, 'store']);
            Route::get('/{id}', [ProductController::class, 'show']);
            Route::put('/{id}', [ProductController::class, 'update']);
            Route::delete('/{id}', [ProductController::class, 'destroy']);
            Route::patch('/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderManagementController::class, 'index']);
            Route::get('/active', [OrderManagementController::class, 'active']);
            Route::get('/{id}', [OrderManagementController::class, 'show']);
            Route::patch('/{id}/status', [OrderManagementController::class, 'updateStatus']);
        });
    });

    // Endpoints para rol:admin.
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', AdminDashboard::class);

        Route::prefix('users')->group(function () {
            Route::get('/', [UserManagementController::class, 'index']);
            Route::get('/{id}', [UserManagementController::class, 'show']);
            Route::put('/{id}', [UserManagementController::class, 'update']);
            Route::delete('/{id}', [UserManagementController::class, 'destroy']);
            Route::patch('/{id}/toggle-status', [UserManagementController::class, 'toggleStatus']);
        });

        Route::prefix('restaurants')->group(function () {
            Route::get('/', [RestaurantManagementController::class, 'index']);
            Route::get('/{id}', [RestaurantManagementController::class, 'show']);
            Route::patch('/{id}/verify', [RestaurantManagementController::class, 'verify']);
            Route::patch('/{id}/toggle-status', [RestaurantManagementController::class, 'toggleStatus']);
            Route::delete('/{id}', [RestaurantManagementController::class, 'destroy']);
        });

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderMonitorController::class, 'index']);
            Route::get('/{id}', [OrderMonitorController::class, 'show']);
        });

        Route::prefix('coupons')->group(function () {
            Route::get('/', [CouponController::class, 'index']);
            Route::post('/', [CouponController::class, 'store']);
            Route::get('/{id}', [CouponController::class, 'show']);
            Route::put('/{id}', [CouponController::class, 'update']);
            Route::delete('/{id}', [CouponController::class, 'destroy']);
        });

        Route::prefix('categories')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index']);
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::get('/{id}', [AdminCategoryController::class, 'show']);
            Route::put('/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/{id}', [AdminCategoryController::class, 'destroy']);
        });

        Route::prefix('reports')->group(function () {
            Route::get('/sales', [ReportController::class, 'sales']);
            Route::get('/restaurants', [ReportController::class, 'restaurants']);
            Route::get('/users', [ReportController::class, 'users']);
        });
    });

    // Health check para Railway
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'app' => config('app.name'),
        'environment' => app()->environment(),
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
        'timestamp' => now()->toIso8601String()
    ]);
});
});

