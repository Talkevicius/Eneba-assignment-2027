<?php

namespace Database\Seeders;

use App\Models\DigitalKey;
use App\Models\Offer;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Database\Seeder;

class DigitalKeySeeder extends Seeder
{
    public function run(): void
    {
        foreach (ProductSeeder::catalog() as $game) {
            $product = Product::query()->where('slug', $game['slug'])->firstOrFail();

            $offers = Offer::query()
                ->where('product_id', $product->id)
                ->with('seller', 'platform', 'region')
                ->get();

            foreach ($offers as $offer) {
                $identity = implode('-', [
                    strtoupper($product->slug),
                    strtoupper($offer->seller->name),
                    strtoupper($offer->platform->slug),
                    strtoupper($offer->region->code),
                ]);
                $identity = preg_replace('/[^A-Z0-9-]+/', '-', $identity);

                for ($keyNumber = 1; $keyNumber <= 3; $keyNumber++) {
                    $keyCode = "DEMO-{$identity}-KEY-{$keyNumber}-NOT-A-REAL-KEY";

                    // firstOrCreate leaves an already-assigned order_item_id untouched on reruns.
                    DigitalKey::query()->firstOrCreate(
                        ['key_code' => $keyCode],
                        [
                            'offer_id' => $offer->id,
                            'order_item_id' => null,
                        ],
                    );
                }
            }
        }
    }
}
