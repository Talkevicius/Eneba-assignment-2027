<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Global', 'code' => 'GLOBAL'],
            ['name' => 'Europe', 'code' => 'EU'],
            ['name' => 'North America', 'code' => 'NA'],
        ] as $region) {
            Region::query()->updateOrCreate(
                ['code' => $region['code']],
                ['name' => $region['name']],
            );
        }
    }
}
