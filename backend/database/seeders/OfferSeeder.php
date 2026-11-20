<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Platform;
use App\Models\Product;
use App\Models\Region;
use App\Models\Seller;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        $sellerNames = [
            'Pixel Harbor',
            'Northstar Digital',
            'Lantern Games',
            'Blue Finch Market',
            'Arcadia Keys',
        ];
        $regionCodes = ['GLOBAL', 'EU', 'NA'];

        foreach (ProductSeeder::catalog() as $productIndex => $game) {
            $product = Product::query()->where('slug', $game['slug'])->firstOrFail();

            for ($offerIndex = 0; $offerIndex < 3; $offerIndex++) {
                $sellerName = $sellerNames[($productIndex + $offerIndex) % count($sellerNames)];
                $platformSlug = $game['platforms'][$offerIndex % count($game['platforms'])];
                $regionCode = $regionCodes[$offerIndex];
                $priceCents = 999 + (($productIndex * 683 + $offerIndex * 457) % 6500);

                Offer::query()->updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'seller_id' => Seller::query()->where('name', $sellerName)->value('id'),
                        'platform_id' => Platform::query()->where('slug', $platformSlug)->value('id'),
                        'region_id' => Region::query()->where('code', $regionCode)->value('id'),
                    ],
                    [
                        'price' => number_format($priceCents / 100, 2, '.', ''),
                        'original_price' => $offerIndex === 1
                            ? null
                            : number_format(($priceCents + 1500) / 100, 2, '.', ''),
                        'currency' => 'EUR',
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
