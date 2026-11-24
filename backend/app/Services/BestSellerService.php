<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class BestSellerService
{
    /** @return Collection<int, Product> */
    public function topProducts(): Collection
    {
        $sales = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('offers', 'offers.id', '=', 'order_items.offer_id')
            ->where('orders.payment_status', 'successful')
            ->select('offers.product_id')
            ->selectRaw('COUNT(order_items.id) AS sales_count')
            ->groupBy('offers.product_id');

        return Product::query()
            ->joinSub($sales, 'product_sales', 'product_sales.product_id', '=', 'products.id')
            ->select('products.*')
            ->selectRaw('product_sales.sales_count AS sales_count')
            ->with([
                'category:id,name,slug',
                'offers' => fn (HasMany $offers) => $offers
                    ->where('is_active', true)
                    ->with([
                        'seller:id,name,rating',
                        'platform:id,name,slug',
                        'region:id,name,code',
                    ])
                    ->orderBy('offers.price')
                    ->orderBy('offers.id'),
            ])
            ->orderByDesc('sales_count')
            ->orderBy('products.title')
            ->orderBy('products.id')
            ->limit(8)
            ->get();
    }
}
