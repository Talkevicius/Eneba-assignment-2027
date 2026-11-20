<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            [
                'title' => 'Find Your Next Adventure',
                'subtitle' => 'Explore demo offers across a wide range of games.',
                'image_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/1332010/header.jpg',
                'target_url' => '/store?category=adventure',
                'display_order' => 1,
            ],
            [
                'title' => 'Strategy, Stories and Worlds',
                'subtitle' => 'Compare fictional RPG offers from multiple sellers.',
                'image_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                'target_url' => '/store?category=rpg',
                'display_order' => 2,
            ],
            [
                'title' => 'Ready for the Next Match?',
                'subtitle' => 'Browse demo sports listings for your platform.',
                'image_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/2669320/header.jpg',
                'target_url' => '/store?category=sports',
                'display_order' => 3,
            ],
        ] as $banner) {
            Banner::query()->updateOrCreate(
                ['title' => $banner['title']],
                [
                    'subtitle' => $banner['subtitle'],
                    'image_url' => $banner['image_url'],
                    'target_url' => $banner['target_url'],
                    'is_active' => true,
                    'display_order' => $banner['display_order'],
                    'starts_at' => null,
                    'ends_at' => null,
                ],
            );
        }
    }
}
