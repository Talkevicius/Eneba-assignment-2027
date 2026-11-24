<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Services\OrderHistoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request, OrderHistoryService $orders): AnonymousResourceCollection
    {
        return OrderResource::collection($orders->paginateFor($request->user()));
    }

    public function show(Request $request, int $id, OrderHistoryService $orders): OrderResource
    {
        return new OrderResource($orders->findForUser($request->user(), $id));
    }
}
