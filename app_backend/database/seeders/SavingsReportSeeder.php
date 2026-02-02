<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SavingsReport;
use Carbon\Carbon;

class SavingsReportSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('status', 'active')->get();

       
        $monthsBack = 6;

        foreach ($users as $user) {
            for ($i = 0; $i < $monthsBack; $i++) {
                $date = Carbon::now()->subMonths($i);

               
                SavingsReport::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'year' => (int) $date->format('Y'),
                        'month' => (int) $date->format('n'),
                    ],
                    [
                        'notes' => "Auto seeded report for {$date->format('Y-m')}",
                    ]
                );
            }
        }
    }
}
