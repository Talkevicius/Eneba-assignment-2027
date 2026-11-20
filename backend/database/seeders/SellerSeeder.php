<?php

namespace Database\Seeders;

use App\Models\Seller;
use Illuminate\Database\Seeder;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Pixel Harbor', 'description' => 'A fictional seller for marketplace demonstrations.', 'rating' => '4.92'],
            ['name' => 'Northstar Digital', 'description' => 'A fictional seller with a broad demo catalog.', 'rating' => '4.86'],
            ['name' => 'Lantern Games', 'description' => 'A fictional independent digital game seller.', 'rating' => '4.78'],
            ['name' => 'Blue Finch Market', 'description' => 'A fictional seller used for offer comparisons.', 'rating' => '4.71'],
            ['name' => 'Arcadia Keys', 'description' => 'A fictional seller for checkout testing.', 'rating' => '4.65'],
        ] as $seller) {
            Seller::query()->updateOrCreate(
                ['name' => $seller['name']],
                [
                    'description' => $seller['description'],
                    'rating' => $seller['rating'],
                ],
            );
        }
    }
}
