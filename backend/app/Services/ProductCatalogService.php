<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCatalogService
{
    /**
     * @param array<string, mixed> $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $matchingOffers = fn (Builder $offers): Builder => $this->applyOfferFilters($offers, $filters);

        $products = Product::query()
            ->with([
                'category:id,name,slug',
                'offers' => function (HasMany $offers) use ($filters): void {
                    $this->applyOfferFilters($offers->getQuery(), $filters)
                        ->with([
                            'seller:id,name,rating',
                            'platform:id,name,slug',
                            'region:id,name,code',
                        ])
                        ->orderBy('offers.price')
                        ->orderBy('offers.id');
                },
            ])
            ->whereHas('offers', $matchingOffers)
            ->withMin(['offers as starting_price' => $matchingOffers], 'price')
            ->when(isset($filters['search']), fn (Builder $query) =>
                $query->whereLike('products.title', "%{$filters['search']}%"))
            ->when(isset($filters['category']), fn (Builder $query) =>
                $query->whereHas('category', fn (Builder $category) => $category->where('slug', $filters['category'])));

        match ($filters['sort'] ?? 'title') {
            'price_asc' => $products->orderBy('starting_price')->orderBy('products.id'),
            'price_desc' => $products->orderByDesc('starting_price')->orderBy('products.id'),
            default => $products->orderBy('products.title')->orderBy('products.id'),
        };

        return $products
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();
    }

    public function findBySlug(string $slug): Product
    {
        return Product::query()
            ->with([
                'category:id,name,slug',
                'offers' => fn (HasMany $offers) => $offers
                    ->where('is_active', true)
                    ->with([
                        'seller:id,name,rating',
                        'platform:id,name,slug',
                        'region:id,name,code',
                    ])
                    ->orderBy('price')
                    ->orderBy('id'),
            ])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyOfferFilters(Builder $offers, array $filters): Builder
    {
        $offers->where('is_active', true);

        if (isset($filters['platform'])) {
            $offers->whereHas('platform', fn (Builder $platform) =>
                $platform->where('slug', $filters['platform']));
        }

        if (isset($filters['region'])) {
            $offers->whereHas('region', fn (Builder $region) =>
                $region->where('code', $filters['region']));
        }

        if (array_key_exists('min_price', $filters) && $filters['min_price'] !== null) {
            $offers->where('price', '>=', $filters['min_price']);
        }

        if (array_key_exists('max_price', $filters) && $filters['max_price'] !== null) {
            $offers->where('price', '<=', $filters['max_price']);
        }

        return $offers;
    }
}
