<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\DigitalKey;
use App\Models\Offer;
use App\Models\Platform;
use App\Models\Product;
use App\Models\Region;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private int $fixtureSequence = 0;

    public function test_authenticated_user_can_checkout_and_receive_unique_keys(): void
    {
        $offer = $this->createOffer(price: '10.25', keyCount: 2);
        $user = User::factory()->create();

        $response = $this->authenticatedPost($user, [
            'items' => [[
                'offer_id' => $offer->id,
                'quantity' => 2,
                'price' => '0.01',
            ]],
            'total' => '0.02',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.total', '20.50')
            ->assertJsonPath('data.currency', 'EUR')
            ->assertJsonPath('data.payment_status', 'successful')
            ->assertJsonPath('data.items.0.product_title', $offer->product->title)
            ->assertJsonPath('data.items.0.seller_name', $offer->seller->name)
            ->assertJsonPath('data.items.0.unit_price', '10.25')
            ->assertJsonCount(2, 'data.items')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'total',
                    'currency',
                    'payment_status',
                    'items' => [
                        '*' => ['id', 'product_title', 'seller_name', 'unit_price', 'currency', 'digital_key'],
                    ],
                ],
            ]);

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 2);
        $order = $user->orders()->with('orderItems.digitalKey')->firstOrFail();

        $this->assertSame('20.50', $order->total);
        $this->assertSame('successful', $order->payment_status);
        $this->assertSame(2, $order->orderItems->count());
        $this->assertSame(2, $order->orderItems->pluck('digitalKey.id')->unique()->count());
        $this->assertSame(2, $order->orderItems->pluck('digitalKey.key_code')->unique()->count());

        foreach ($order->orderItems as $item) {
            $this->assertSame($offer->product->title, $item->product_title);
            $this->assertSame($offer->seller->name, $item->seller_name);
            $this->assertSame('10.25', $item->unit_price);
            $this->assertSame('EUR', $item->currency);
            $this->assertNotNull($item->digitalKey);
            $this->assertSame($item->id, $item->digitalKey->order_item_id);
        }

        $returnedKeys = collect($response->json('data.items'))->pluck('digital_key')->sort()->values();
        $assignedKeys = $order->orderItems->pluck('digitalKey.key_code')->sort()->values();
        $this->assertSame($assignedKeys->all(), $returnedKeys->all());
    }

    public function test_checkout_requires_authentication_and_creates_no_records(): void
    {
        $offer = $this->createOffer(keyCount: 1);

        $this->postJson('/api/checkout', [
            'items' => [['offer_id' => $offer->id, 'quantity' => 1]],
        ])->assertUnauthorized();

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(0, DigitalKey::query()->whereNotNull('order_item_id')->count());
    }

    public function test_checkout_with_insufficient_keys_returns_conflict_without_side_effects(): void
    {
        $offer = $this->createOffer(keyCount: 1);
        $user = User::factory()->create();

        $this->authenticatedPost($user, [
            'items' => [['offer_id' => $offer->id, 'quantity' => 2]],
        ])->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(0, DigitalKey::query()->whereNotNull('order_item_id')->count());
    }

    public function test_inactive_offer_cannot_be_purchased(): void
    {
        $offer = $this->createOffer(isActive: false, keyCount: 1);
        $user = User::factory()->create();

        $this->authenticatedPost($user, [
            'items' => [['offer_id' => $offer->id, 'quantity' => 1]],
        ])->assertStatus(409);

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(0, DigitalKey::query()->whereNotNull('order_item_id')->count());
    }

    public function test_checkout_rejects_mixed_currencies_without_side_effects(): void
    {
        $euroOffer = $this->createOffer(currency: 'EUR', keyCount: 1);
        $usdOffer = $this->createOffer(currency: 'USD', keyCount: 1);
        $user = User::factory()->create();

        $this->authenticatedPost($user, [
            'items' => [
                ['offer_id' => $euroOffer->id, 'quantity' => 1],
                ['offer_id' => $usdOffer->id, 'quantity' => 1],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors('items');

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertSame(0, DigitalKey::query()->whereNotNull('order_item_id')->count());
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function authenticatedPost(User $user, array $payload)
    {
        return $this->withToken($user->createToken('checkout-test')->plainTextToken)
            ->postJson('/api/checkout', $payload, ['Accept' => 'application/json']);
    }

    private function createOffer(
        string $currency = 'EUR',
        bool $isActive = true,
        string $price = '19.99',
        int $keyCount = 0,
    ): Offer {
        $suffix = ++$this->fixtureSequence;
        $category = Category::query()->create([
            'name' => "Checkout Category {$suffix}",
            'slug' => "checkout-category-{$suffix}",
        ]);
        $platform = Platform::query()->create([
            'name' => "Checkout Platform {$suffix}",
            'slug' => "checkout-platform-{$suffix}",
        ]);
        $region = Region::query()->create([
            'name' => "Checkout Region {$suffix}",
            'code' => "R{$suffix}",
        ]);
        $seller = Seller::query()->create([
            'name' => "Checkout Seller {$suffix}",
            'description' => 'Fictional checkout test seller.',
            'rating' => '4.50',
        ]);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'title' => "Checkout Product {$suffix}",
            'slug' => "checkout-product-{$suffix}",
            'description' => 'Fictional checkout test product.',
            'image_url' => 'https://example.test/checkout-product.jpg',
            'developer' => null,
            'publisher' => null,
            'release_date' => null,
        ]);
        $offer = Offer::query()->create([
            'product_id' => $product->id,
            'seller_id' => $seller->id,
            'platform_id' => $platform->id,
            'region_id' => $region->id,
            'price' => $price,
            'original_price' => null,
            'currency' => $currency,
            'is_active' => $isActive,
        ]);

        for ($keyNumber = 1; $keyNumber <= $keyCount; $keyNumber++) {
            DigitalKey::query()->create([
                'offer_id' => $offer->id,
                'order_item_id' => null,
                'key_code' => "DEMO-CHECKOUT-{$suffix}-KEY-{$keyNumber}-NOT-A-REAL-KEY",
            ]);
        }

        return $offer->load('product', 'seller');
    }
}
