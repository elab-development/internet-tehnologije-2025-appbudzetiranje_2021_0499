<?php

namespace App\Http\Controllers;

use App\Models\SavingsReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Http\Resources\SavingsReportResource;

class SavingsReportController extends Controller
{
    /**
     * List all monthly savings reports for the authenticated user.
     * Accessible only by regular users.
     */
    public function index()
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $reports = SavingsReport::where('user_id', $user->id)->get();
        return SavingsReportResource::collection($reports);
    }

    /**
     * Create a new monthly savings report.
     * Accessible only by regular users.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $data = $request->validate([
            'year'  => 'required|integer|min:2000|max:2100',
            'month' => [
                'required',
                'integer',
                'between:1,12',
                Rule::unique('savings_reports')
                    ->where('user_id', $user->id)
            ],
            'notes' => 'nullable|string',
        ]);

        $report = SavingsReport::create([
            'user_id' => $user->id,
            'year'    => $data['year'],
            'month'   => $data['month'],
            'notes'   => $data['notes'] ?? null,
        ]);

        return new SavingsReportResource($report);
    }

    /**
     * Show a specific monthly savings report.
     * Accessible only by regular users.
     */
    public function show($id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $report = SavingsReport::find($id);
        if (! $report || $report->user_id !== $user->id) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        return new SavingsReportResource($report);
    }

    /**
     * Update an existing monthly savings report.
     * Accessible only by regular users.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $report = SavingsReport::find($id);
        if (! $report || $report->user_id !== $user->id) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        $data = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $report->update($data);
        return new SavingsReportResource($report);
    }

    /**
     * Delete a monthly savings report.
     * Accessible only by regular users.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $report = SavingsReport::find($id);
        if (! $report || $report->user_id !== $user->id) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        $report->delete();
        return response()->json(['message' => 'Report deleted successfully.'], 200);
    }

      /**
     * Retrieve statistics for the authenticated user's savings reports.
     * Returns count, total and average expenses per report.
     * Accessible only by regular users.
     */
    public function statistics()
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $reports = SavingsReport::where('user_id', $user->id)
            ->withCount('expenses')
            ->withSum('expenses', 'amount')
            ->get();

        $stats = $reports->map(function ($report) {
            $count = $report->expenses_count;
            $sum   = $report->expenses_sum_amount ?? 0;
            $avg   = $count ? round($sum / $count, 2) : 0;

            return [
                'report_id'        => $report->id,
                'year'             => $report->year,
                'month'            => $report->month,
                'expenses_count'   => $count,
                'total_expenses'   => $sum,
                'average_expense'  => $avg,
            ];
        });

        return response()->json(['statistics' => $stats]);
    }
}
