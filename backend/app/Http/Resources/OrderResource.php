<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'total' => $this->total,
            'currency' => $this->currency,
            'payment_status' => $this->payment_status,
            'created_at' => $this->created_at?->toISOString(),
            'items' => $this->whenLoaded('orderItems', function (): array {
                return $this->orderItems->map(function ($item): array {
                    $itemData = [
                        'id' => $item->id,
                        'product_title' => $item->product_title,
                        'seller_name' => $item->seller_name,
                        'unit_price' => $item->unit_price,
                        'currency' => $item->currency,
                    ];

                    if ($this->payment_status === 'successful' && $item->relationLoaded('digitalKey')) {
                        $itemData['digital_key'] = $item->digitalKey?->key_code;
                    }

                    return $itemData;
                })->all();
            }),
        ];
    }
}
