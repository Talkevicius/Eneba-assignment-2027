<?php

namespace App\Http\Controllers;

use App\Http\Requests\Catalog\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductCatalogService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(
        ProductIndexRequest $request,
        ProductCatalogService $catalog,
    ): AnonymousResourceCollection {
        $products = $catalog->paginate($request->validated());

        return ProductResource::collection($products);
    }

    public function show(string $slug, ProductCatalogService $catalog): ProductResource
    {
        return new ProductResource($catalog->findBySlug($slug));
    }
}
