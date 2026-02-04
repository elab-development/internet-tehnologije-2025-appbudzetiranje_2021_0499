<?php
// app/Http/Resources/ExpenseResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                  => $this->id,
            'savings_report_id'   => $this->savings_report_id,
            'amount'              => $this->amount,
            'currency'            => $this->currency,
            'description'         => $this->description,
            'date'                => $this->date,
            'category'            => $this->category,
            'payment_method'      => $this->payment_method,
            'receipt_image'       => $this->receipt_image,
            'is_recurring'        => $this->is_recurring,
            'recurring_interval'  => $this->recurring_interval,
            'tags'                => $this->tags,
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}
