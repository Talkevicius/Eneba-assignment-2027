<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderHistoryService
{
    public function paginateFor(User $user): LengthAwarePaginator
    {
        return $user->orders()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function findForUser(User $user, int $orderId): Order
    {
        $order = $user->orders()
            ->with('orderItems')
            ->findOrFail($orderId);

        if ($order->payment_status === 'successful') {
            $order->load('orderItems.digitalKey');
        }

        return $order;
    }
}
