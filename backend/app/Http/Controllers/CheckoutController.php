<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __invoke(CheckoutRequest $request, CheckoutService $checkout): JsonResponse
    {
        $order = $checkout->checkout($request->user(), $request->validated()['items']);

        return (new OrderResource($order))->response()->setStatusCode(201);
    }
}
