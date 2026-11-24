<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Http\Resources\ProductResource;
use App\Services\BannerService;
use App\Services\BestSellerService;
use App\Services\DealService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HomeController extends Controller
{
    public function banners(BannerService $banners): AnonymousResourceCollection
    {
        return BannerResource::collection($banners->active());
    }

    public function bestSellers(BestSellerService $bestSellers): AnonymousResourceCollection
    {
        return ProductResource::collection($bestSellers->topProducts());
    }

    public function deals(DealService $deals): AnonymousResourceCollection
    {
        return ProductResource::collection($deals->products());
    }
}
