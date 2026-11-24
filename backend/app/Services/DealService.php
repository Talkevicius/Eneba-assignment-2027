<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class DealService
{
    /** @return Collection<int, Product> */
    public function products(): Collection
    {
        $qualifyingOffers = DB::table('offers')
            ->where('is_active', true)
            ->whereNotNull('original_price')
            ->whereColumn('original_price', '>', 'price');

        $qualifyingProductIds = (clone $qualifyingOffers)
            ->select('product_id')
            ->distinct();

        return Product::query()
            ->whereIn('products.id', $qualifyingProductIds)
            ->with([
                'category:id,name,slug',
                'offers' => fn (HasMany $offers) => $offers
                    ->where('is_active', true)
                    ->with([
                        'seller:id,name,rating',
                        'platform:id,name,slug',
                        'region:id,name,code',
                    ])
                    ->orderBy('offers.price')
                    ->orderBy('offers.id'),
            ])
            ->orderBy('products.title')
            ->orderBy('products.id')
            ->limit(8)
            ->get();
    }
}
