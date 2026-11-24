<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'seller' => [
                'id' => $this->seller->id,
                'name' => $this->seller->name,
                'rating' => $this->seller->rating,
            ],
            'platform' => [
                'id' => $this->platform->id,
                'name' => $this->platform->name,
                'slug' => $this->platform->slug,
            ],
            'region' => [
                'id' => $this->region->id,
                'name' => $this->region->name,
                'code' => $this->region->code,
            ],
            'price' => $this->price,
            'original_price' => $this->original_price,
            'currency' => $this->currency,
        ];
    }
}
