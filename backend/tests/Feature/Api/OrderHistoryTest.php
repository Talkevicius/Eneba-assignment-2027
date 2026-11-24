<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\DigitalKey;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Platform;
use App\Models\Product;
use App\Models\Region;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_only_their_orders_with_ten_per_page_and_without_items_or_keys(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $offer = $this->createOffer();

        for ($number = 1; $number <= 11; $number++) {
            $this->createOrder($user, $offer, "LIST-KEY-{$number}");
        }

        $otherOrder = $this->createOrder($otherUser, $offer, 'OTHER-USER-LIST-KEY');

        $this->getJson('/api/orders')->assertUnauthorized();

        $response = $this->withToken($user->createToken('order-history-test')->plainTextToken)
            ->getJson('/api/orders', ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 11)
            ->assertJsonPath('meta.per_page', 10);

        foreach ($response->json('data') as $listedOrder) {
            $this->assertArrayNotHasKey('items', $listedOrder);
            $this->assertArrayNotHasKey('digital_key', $listedOrder);
            $this->assertNotSame($otherOrder->id, $listedOrder['id']);
        }
    }

    public function test_user_can_view_their_successful_order_and_assigned_key(): void
    {
        $user = User::factory()->create();
        $offer = $this->createOffer();
        $order = $this->createOrder($user, $offer, 'SUCCESSFUL-ORDER-KEY');

        $response = $this->withToken($user->createToken('order-history-test')->plainTextToken)
            ->getJson("/api/orders/{$order->id}", ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $order->id)
            ->assertJsonPath('data.payment_status', 'successful')
            ->assertJsonPath('data.items.0.product_title', 'Order History Test Product')
            ->assertJsonPath('data.items.0.seller_name', 'Order History Test Seller')
            ->assertJsonPath('data.items.0.unit_price', '12.34')
            ->assertJsonPath('data.items.0.currency', 'EUR')
            ->assertJsonPath('data.items.0.digital_key', 'SUCCESSFUL-ORDER-KEY');
    }

    public function test_non_successful_order_does_not_return_digital_key_codes(): void
    {
        $user = User::factory()->create();
        $offer = $this->createOffer();
        $order = $this->createOrder($user, $offer, 'PENDING-ORDER-KEY', 'pending');

        $response = $this->withToken($user->createToken('order-history-test')->plainTextToken)
            ->getJson("/api/orders/{$order->id}", ['Accept' => 'application/json']);

        $response->assertOk()->assertJsonPath('data.payment_status', 'pending');
        $this->assertArrayNotHasKey('digital_key', $response->json('data.items.0'));
        $this->assertStringNotContainsString('PENDING-ORDER-KEY', $response->getContent());
    }

    public function test_user_receives_not_found_for_another_users_order(): void
    {
        $owner = User::factory()->create();
        $requestingUser = User::factory()->create();
        $offer = $this->createOffer();
        $order = $this->createOrder($owner, $offer, 'PRIVATE-ORDER-KEY');

        $this->withToken($requestingUser->createToken('order-history-test')->plainTextToken)
            ->getJson("/api/orders/{$order->id}", ['Accept' => 'application/json'])
            ->assertNotFound();
    }

    private function createOffer(): Offer
    {
        $category = Category::query()->create([
            'name' => 'Order History Test Category',
            'slug' => 'order-history-test-category',
        ]);
        $platform = Platform::query()->create([
            'name' => 'Order History Test Platform',
            'slug' => 'order-history-test-platform',
        ]);
        $region = Region::query()->create([
            'name' => 'Order History Test Region',
            'code' => 'OHT',
        ]);
        $seller = Seller::query()->create([
            'name' => 'Order History Test Seller',
            'description' => 'Fictional order history test seller.',
            'rating' => '4.50',
        ]);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'title' => 'Order History Test Product',
            'slug' => 'order-history-test-product',
            'description' => 'Fictional order history test product.',
            'image_url' => 'https://example.test/order-history-product.jpg',
            'developer' => null,
            'publisher' => null,
            'release_date' => null,
        ]);

        return Offer::query()->create([
            'product_id' => $product->id,
            'seller_id' => $seller->id,
            'platform_id' => $platform->id,
            'region_id' => $region->id,
            'price' => '12.34',
            'original_price' => null,
            'currency' => 'EUR',
            'is_active' => true,
        ]);
    }

    private function createOrder(
        User $user,
        Offer $offer,
        string $keyCode,
        string $paymentStatus = 'successful',
    ): Order {
        $order = Order::query()->create([
            'user_id' => $user->id,
            'total' => '12.34',
            'currency' => 'EUR',
            'payment_status' => $paymentStatus,
        ]);

        $item = OrderItem::query()->create([
            'order_id' => $order->id,
            'offer_id' => $offer->id,
            'product_title' => 'Order History Test Product',
            'seller_name' => 'Order History Test Seller',
            'unit_price' => '12.34',
            'currency' => 'EUR',
        ]);

        DigitalKey::query()->create([
            'offer_id' => $offer->id,
            'order_item_id' => $item->id,
            'key_code' => $keyCode,
        ]);

        return $order;
    }
}
