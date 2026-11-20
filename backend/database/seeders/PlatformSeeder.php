<?php

namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Steam', 'slug' => 'steam'],
            ['name' => 'PlayStation', 'slug' => 'playstation'],
            ['name' => 'Xbox', 'slug' => 'xbox'],
            ['name' => 'Nintendo', 'slug' => 'nintendo'],
        ] as $platform) {
            Platform::query()->updateOrCreate(
                ['slug' => $platform['slug']],
                ['name' => $platform['name']],
            );
        }
    }
}
