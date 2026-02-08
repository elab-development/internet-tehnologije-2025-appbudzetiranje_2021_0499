<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ExpenseResource;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ExpenseController extends Controller
{
    /**
     * List all expenses for the authenticated user.
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

        $expenses = Expense::whereHas('savingsReport', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->get();

        return ExpenseResource::collection($expenses);
    }

    /**
     * Create a new expense.
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
            'savings_report_id' => 'required|exists:savings_reports,id',
            'amount'            => 'required|numeric',
            'currency'          => 'required|string|size:3',
            'description'       => 'required|string',
            'date'              => 'required|date',
            'category'          => [
                'required',
                Rule::in([
                    'shopping',
                    'food',
                    'medicines',
                    'sports_and_recreation',
                    'entertainment',
                    'bills',
                ]),
            ],
            'payment_method'    => 'required|in:cash,card',
            'receipt_image'     => 'nullable|url',
            'is_recurring'      => 'boolean',
            'recurring_interval'=> 'nullable|string',
            'tags'              => 'nullable|array',
            'tags.*'            => 'string',
        ]);

        // Ensure the savings report belongs to this user
        $report = $user->savingsReports()->find($data['savings_report_id']);
        if (! $report) {
            return response()->json(['error' => 'Invalid savings report.'], 403);
        }

        $expense = Expense::create($data);

        return new ExpenseResource($expense);
    }

    /**
     * Show a single expense.
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

        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json(['error' => 'Expense not found.'], 404);
        }

        if ($expense->savingsReport->user_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        return new ExpenseResource($expense);
    }

    /**
     * Update an existing expense.
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

        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json(['error' => 'Expense not found.'], 404);
        }
        if ($expense->savingsReport->user_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $data = $request->validate([
            'savings_report_id' => 'sometimes|required|exists:savings_reports,id',
            'amount'            => 'sometimes|required|numeric',
            'currency'          => 'sometimes|required|string|size:3',
            'description'       => 'sometimes|required|string',
            'date'              => 'sometimes|required|date',
            'category'          => [
                'sometimes',
                'required',
                Rule::in([
                    'shopping',
                    'food',
                    'medicines',
                    'sports_and_recreation',
                    'entertainment',
                    'bills',
                ]),
            ],
            'payment_method'    => 'sometimes|required|in:cash,card',
            'receipt_image'     => 'nullable|url',
            'is_recurring'      => 'boolean',
            'recurring_interval'=> 'nullable|string',
            'tags'              => 'nullable|array',
            'tags.*'            => 'string',
        ]);

        // If savings_report_id changed, re-validate ownership
        if (isset($data['savings_report_id'])) {
            $report = $user->savingsReports()->find($data['savings_report_id']);
            if (! $report) {
                return response()->json(['error' => 'Invalid savings report.'], 403);
            }
        }

        $expense->update($data);

        return new ExpenseResource($expense);
    }

    /**
     * Delete an expense.
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

        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json(['error' => 'Expense not found.'], 404);
        }
        if ($expense->savingsReport->user_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully.'], 200);
    }

    /**
     * Patch-only update of the month part of the expense date.
     * Accessible only by regular users.
     */
    public function updateMonth(Request $request, $id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $expense = Expense::find($id);
        if (! $expense) {
            return response()->json(['error' => 'Expense not found.'], 404);
        }
        if ($expense->savingsReport->user_id !== $user->id) {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $data = $request->validate([
            'month' => 'required|integer|between:1,12',
        ]);

        $currentDate   = Carbon::parse($expense->date);
        $newDate       = $currentDate->setMonth($data['month']);
        $expense->date = $newDate->toDateString();
        $expense->save();

        return new ExpenseResource($expense);
    }
}
