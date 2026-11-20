<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Demo catalog with platform availability used by OfferSeeder.
     * Platform availability is seed metadata and is not persisted as a product column.
     */
    public static function catalog(): array
    {
        return [
            ['title' => 'DOOM Eternal', 'slug' => 'doom-eternal', 'category' => 'action', 'app_id' => '782330', 'developer' => 'id Software', 'publisher' => 'Bethesda Softworks', 'release_date' => '2020-03-20', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'God of War Ragnarök', 'slug' => 'god-of-war-ragnarok', 'category' => 'action', 'app_id' => '2322010', 'developer' => 'Santa Monica Studio', 'publisher' => 'PlayStation Publishing LLC', 'release_date' => '2022-11-09', 'platforms' => ['steam', 'playstation']],
            ['title' => "Marvel's Spider-Man Remastered", 'slug' => 'marvels-spider-man-remastered', 'category' => 'action', 'app_id' => '1817070', 'developer' => 'Insomniac Games', 'publisher' => 'PlayStation Publishing LLC', 'release_date' => '2022-08-12', 'platforms' => ['steam', 'playstation']],
            ['title' => 'Resident Evil 4', 'slug' => 'resident-evil-4', 'category' => 'action', 'app_id' => '2050650', 'developer' => 'Capcom', 'publisher' => 'Capcom', 'release_date' => '2023-03-24', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'Hades', 'slug' => 'hades', 'category' => 'action', 'app_id' => '1145360', 'developer' => 'Supergiant Games', 'publisher' => 'Supergiant Games', 'release_date' => '2020-09-17', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],

            ['title' => "Baldur's Gate 3", 'slug' => 'baldurs-gate-3', 'category' => 'rpg', 'app_id' => '1086940', 'portrait_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg', 'developer' => 'Larian Studios', 'publisher' => 'Larian Studios', 'release_date' => '2023-08-03', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'Elden Ring', 'slug' => 'elden-ring', 'category' => 'rpg', 'app_id' => '1245620', 'portrait_url' => 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900.jpg', 'developer' => 'FromSoftware', 'publisher' => 'Bandai Namco Entertainment', 'release_date' => '2022-02-25', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'Cyberpunk 2077', 'slug' => 'cyberpunk-2077', 'category' => 'rpg', 'app_id' => '1091500', 'portrait_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg', 'developer' => 'CD PROJEKT RED', 'publisher' => 'CD PROJEKT RED', 'release_date' => '2020-12-10', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'The Witcher 3: Wild Hunt', 'slug' => 'the-witcher-3-wild-hunt', 'category' => 'rpg', 'app_id' => '292030', 'portrait_url' => 'https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900.jpg', 'developer' => 'CD PROJEKT RED', 'publisher' => 'CD PROJEKT RED', 'release_date' => '2015-05-18', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'The Elder Scrolls V: Skyrim Special Edition', 'slug' => 'skyrim-special-edition', 'category' => 'rpg', 'app_id' => '489830', 'portrait_url' => 'https://steamcdn-a.akamaihd.net/steam/apps/489830/library_600x900.jpg', 'developer' => 'Bethesda Game Studios', 'publisher' => 'Bethesda Softworks', 'release_date' => '2016-10-28', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],

            ['title' => 'Stray', 'slug' => 'stray', 'category' => 'adventure', 'app_id' => '1332010', 'developer' => 'BlueTwelve Studio', 'publisher' => 'Annapurna Interactive', 'release_date' => '2022-07-19', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'Tomb Raider', 'slug' => 'tomb-raider-2013', 'category' => 'adventure', 'app_id' => '203160', 'portrait_url' => 'https://cdn.akamai.steamstatic.com/steam/apps/203160/library_600x900.jpg', 'developer' => 'Crystal Dynamics', 'publisher' => 'Crystal Dynamics', 'release_date' => '2013-03-05', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'Uncharted: Legacy of Thieves Collection', 'slug' => 'uncharted-legacy-of-thieves-collection', 'category' => 'adventure', 'app_id' => '1659420', 'portrait_url' => 'https://steamcdn-a.akamaihd.net/steam/apps/1659420/library_600x900.jpg', 'developer' => 'Naughty Dog', 'publisher' => 'PlayStation Publishing LLC', 'release_date' => '2022-10-19', 'platforms' => ['steam', 'playstation']],
            ['title' => 'It Takes Two', 'slug' => 'it-takes-two', 'category' => 'adventure', 'app_id' => '1426210', 'portrait_url' => 'https://steamcdn-a.akamaihd.net/steam/apps/1426210/library_600x900.jpg', 'developer' => 'Hazelight Studios', 'publisher' => 'Electronic Arts', 'release_date' => '2021-03-26', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'Ori and the Will of the Wisps', 'slug' => 'ori-and-the-will-of-the-wisps', 'category' => 'adventure', 'app_id' => '1057090', 'developer' => 'Moon Studios GmbH', 'publisher' => 'Xbox Game Studios', 'release_date' => '2020-03-11', 'platforms' => ['steam', 'xbox', 'nintendo']],

            ['title' => 'EA SPORTS FC 25', 'slug' => 'ea-sports-fc-25', 'category' => 'sports', 'app_id' => '2669320', 'developer' => 'EA Canada', 'publisher' => 'Electronic Arts', 'release_date' => '2024-09-27', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'NBA 2K25', 'slug' => 'nba-2k25', 'category' => 'sports', 'app_id' => '2878980', 'developer' => 'Visual Concepts', 'publisher' => '2K', 'release_date' => '2024-09-06', 'platforms' => ['steam', 'playstation', 'xbox', 'nintendo']],
            ['title' => 'F1 24', 'slug' => 'f1-24', 'category' => 'sports', 'app_id' => '2488620', 'developer' => 'Codemasters', 'publisher' => 'Electronic Arts', 'release_date' => '2024-05-31', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'Madden NFL 25', 'slug' => 'madden-nfl-25', 'category' => 'sports', 'app_id' => '2582560', 'developer' => 'EA Orlando', 'publisher' => 'Electronic Arts', 'release_date' => '2024-08-16', 'platforms' => ['steam', 'playstation', 'xbox']],
            ['title' => 'WWE 2K24', 'slug' => 'wwe-2k24', 'category' => 'sports', 'app_id' => '2315690', 'developer' => 'Visual Concepts', 'publisher' => '2K', 'release_date' => '2024-03-08', 'platforms' => ['steam', 'playstation', 'xbox']],
        ];
    }

    public function run(): void
    {
        foreach (self::catalog() as $game) {
            $category = Category::query()->where('slug', $game['category'])->firstOrFail();

            Product::query()->updateOrCreate(
                ['slug' => $game['slug']],
                [
                    'category_id' => $category->id,
                    'title' => $game['title'],
                    'description' => "Demo catalog listing for {$game['title']}; provided for marketplace browsing and checkout testing.",
                    'image_url' => $game['portrait_url'] ?? "https://cdn.akamai.steamstatic.com/steam/apps/{$game['app_id']}/header.jpg",
                    'developer' => $game['developer'],
                    'publisher' => $game['publisher'],
                    'release_date' => $game['release_date'],
                ],
            );
        }
    }
}
