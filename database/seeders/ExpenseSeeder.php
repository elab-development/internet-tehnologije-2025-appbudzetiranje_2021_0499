<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Expense;
use App\Models\SavingsReport;
use Carbon\Carbon;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $reports = SavingsReport::all();

        foreach ($reports as $report) {
           
            $count = rand(8, 25);

           
            for ($i = 0; $i < $count; $i++) {

                $dateInMonth = Carbon::create($report->year, $report->month, 1)
                    ->addDays(rand(0, 27)); 

                Expense::factory()->create([
                    'savings_report_id' => $report->id,
                    'date' => $dateInMonth->format('d-m-Y'),
                ]);
            }
        }
    }
}
