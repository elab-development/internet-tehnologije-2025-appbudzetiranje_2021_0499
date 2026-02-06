<?php
// app/Http/Resources/SavingsReportResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ExpenseResource;

class SavingsReportResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'year'         => $this->year,
            'month'        => $this->month,
            'notes'        => $this->notes,
            'period_start' => $this->period_start,
            'period_end'   => $this->period_end,
            'expenses'     => ExpenseResource::collection($this->whenLoaded('expenses')),
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
