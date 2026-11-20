<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Action', 'slug' => 'action'],
            ['name' => 'RPG', 'slug' => 'rpg'],
            ['name' => 'Adventure', 'slug' => 'adventure'],
            ['name' => 'Sports', 'slug' => 'sports'],
        ] as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                ['name' => $category['name']],
            );
        }
    }
}
