<?php

namespace App\Services;

use App\Models\DigitalKey;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * @param array<int, array{offer_id: int|string, quantity: int|string}> $items
     */
    public function checkout(User $user, array $items): Order
    {
        return DB::transaction(function () use ($user, $items): Order {
            $quantities = collect($items)
                ->mapWithKeys(fn (array $item): array => [(int) $item['offer_id'] => (int) $item['quantity']]);
            $offers = Offer::query()
                ->whereIn('id', $quantities->keys())
                ->orderBy('id')
                ->lockForUpdate()
                ->with(['product:id,title', 'seller:id,name'])
                ->get()
                ->keyBy('id');

            if ($offers->count() !== $quantities->count()) {
                throw ValidationException::withMessages([
                    'items' => ['One or more selected offers are invalid.'],
                ]);
            }

            $currency = null;
            $keysByOffer = [];
            $totalCents = 0;

            /** @var Offer $offer */
            foreach ($offers as $offer) {
                if (! $offer->is_active) {
                    $this->conflict('One or more selected offers are no longer available.');
                }

                if ($currency !== null && $currency !== $offer->currency) {
                    throw ValidationException::withMessages([
                        'items' => ['All selected offers must use the same currency.'],
                    ]);
                }

                $currency = $offer->currency;
                $quantity = $quantities->get($offer->id);
                $unitCents = $this->toCents((string) $offer->price);
                $maximumTotalCents = 9_999_999_999;

                if ($unitCents > 0 && $quantity > intdiv($maximumTotalCents - $totalCents, $unitCents)) {
                    throw ValidationException::withMessages([
                        'items' => ['The checkout total exceeds the supported amount.'],
                    ]);
                }

                $totalCents += $unitCents * $quantity;

                $keys = DigitalKey::query()
                    ->where('offer_id', $offer->id)
                    ->whereNull('order_item_id')
                    ->orderBy('id')
                    ->limit($quantity)
                    ->lockForUpdate()
                    ->get();

                if ($keys->count() !== $quantity) {
                    $this->conflict('There is not enough key inventory for one or more selected offers.');
                }

                $keysByOffer[$offer->id] = $keys;
            }

            $order = Order::query()->create([
                'user_id' => $user->id,
                'total' => $this->fromCents($totalCents),
                'currency' => $currency,
                'payment_status' => 'pending',
            ]);

            foreach ($offers as $offer) {
                /** @var Collection<int, DigitalKey> $keys */
                $keys = $keysByOffer[$offer->id];

                foreach ($keys as $key) {
                    $orderItem = OrderItem::query()->create([
                        'order_id' => $order->id,
                        'offer_id' => $offer->id,
                        'product_title' => $offer->product->title,
                        'seller_name' => $offer->seller->name,
                        'unit_price' => $offer->price,
                        'currency' => $offer->currency,
                    ]);

                    $key->order_item_id = $orderItem->id;
                    $key->save();
                }
            }

            $order->payment_status = 'successful';
            $order->save();

            return $order->load('orderItems.digitalKey');
        });
    }

    private function toCents(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '00');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function fromCents(int $cents): string
    {
        return intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }

    private function conflict(string $message): never
    {
        throw new HttpResponseException(response()->json(['message' => $message], 409));
    }
}
