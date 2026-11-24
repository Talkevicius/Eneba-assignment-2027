<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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

        $lowestPrices = (clone $qualifyingOffers)
            ->select('product_id')
            ->selectRaw('MIN(price) AS lowest_price')
            ->groupBy('product_id');

        $selectedOfferIds = (clone $qualifyingOffers)
            ->joinSub($lowestPrices, 'lowest_prices', function ($join): void {
                $join->on('lowest_prices.product_id', '=', 'offers.product_id')
                    ->on('lowest_prices.lowest_price', '=', 'offers.price');
            })
            ->selectRaw('MIN(offers.id) AS id')
            ->groupBy('offers.product_id');

        return Product::query()
            ->whereIn('id', function ($query) use ($selectedOfferIds): void {
                $query->fromSub($selectedOfferIds, 'selected_offers')->select('id');
            })
            ->with([
                'category:id,name,slug',
                'offers' => fn (Builder $offers) => $offers
                    ->whereIn('offers.id', function ($query) use ($selectedOfferIds): void {
                        $query->fromSub($selectedOfferIds, 'selected_offers')->select('id');
                    })
                    ->with([
                        'seller:id,name,rating',
                        'platform:id,name,slug',
                        'region:id,name,code',
                    ])
                    ->orderBy('price')
                    ->orderBy('id'),
            ])
            ->orderBy('products.title')
            ->orderBy('products.id')
            ->limit(8)
            ->get();
    }
}
