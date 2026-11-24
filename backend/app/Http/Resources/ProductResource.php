<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'developer' => $this->developer,
            'publisher' => $this->publisher,
            'release_date' => $this->release_date?->toDateString(),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'starting_price' => $this->when(
                array_key_exists('starting_price', $attributes),
                $this->starting_price,
            ),
            'currency' => $this->when(
                array_key_exists('starting_price', $attributes),
                'EUR',
            ),
            'sales_count' => $this->when(
                array_key_exists('sales_count', $attributes),
                (int) $this->sales_count,
            ),
            'offers' => OfferResource::collection($this->whenLoaded('offers')),
        ];
    }
}
