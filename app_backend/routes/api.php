<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMessageController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\SavingsReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Public auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('logout', [AuthController::class, 'logout']);

    // ---- Admin-only user management (regular users list + CSV export)
    Route::get('admin/users/regulars',        [UserController::class, 'adminRegulars']);
    Route::get('admin/users/regulars/export', [UserController::class, 'exportRegularsCsv']);

    // Users
    Route::apiResource('users', UserController::class);

    // Groups + messages
    Route::get ('groups/{id}/messages', [GroupMessageController::class, 'index']);
    Route::post('groups/{id}/messages', [GroupMessageController::class, 'store']);

    Route::post('groups/{id}/join',    [GroupController::class, 'join']);
    Route::post('groups/{id}/members', [GroupController::class, 'addMember']);

    Route::apiResource('groups', GroupController::class);

    // Savings Reports
    Route::get   ('savings-reports/statistics',     [SavingsReportController::class, 'statistics']);
    Route::get   ('savings-reports/{id}/analytics', [SavingsReportController::class, 'analytics']);
    Route::get   ('savings-reports',                [SavingsReportController::class, 'index']);
    Route::post  ('savings-reports',                [SavingsReportController::class, 'store']);
    Route::get   ('savings-reports/{id}',           [SavingsReportController::class, 'show']);
    Route::patch ('savings-reports/{id}',           [SavingsReportController::class, 'update']);
    Route::delete('savings-reports/{id}',           [SavingsReportController::class, 'destroy']);

    // Expenses
    Route::get   ('expenses',              [ExpenseController::class, 'index']);
    Route::post  ('expenses',              [ExpenseController::class, 'store']);
    Route::get   ('expenses/{id}',         [ExpenseController::class, 'show']);
    Route::put   ('expenses/{id}',         [ExpenseController::class, 'update']);
    Route::delete('expenses/{id}',         [ExpenseController::class, 'destroy']);
    Route::patch ('expenses/{id}/month',   [ExpenseController::class, 'updateMonth']);
});