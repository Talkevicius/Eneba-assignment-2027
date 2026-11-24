<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_an_access_token(): void
    {
        $password = 'a-secure-password';

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'new-user@example.test',
            'password' => $password,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.name', 'Test User')
            ->assertJsonPath('data.user.email', 'new-user@example.test')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'new-user@example.test',
        ]);

        $user = User::query()->where('email', 'new-user@example.test')->firstOrFail();
        $this->assertTrue(Hash::check($password, $user->password));
        $this->assertNotSame($password, $user->password);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'existing-user@example.test',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Another User',
            'email' => 'existing-user@example.test',
            'password' => 'a-secure-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_user_can_log_in_and_receive_an_access_token(): void
    {
        $password = 'a-secure-password';
        $user = User::factory()->create([
            'email' => 'login-user@example.test',
            'password' => $password,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login-user@example.test',
            'password' => $password,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.email', 'login-user@example.test')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_user_endpoint_rejects_unauthenticated_requests(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_logout_revokes_only_the_current_access_token(): void
    {
        $user = User::factory()->create();
        $currentToken = $user->createToken('current-token');
        $otherToken = $user->createToken('other-token');

        $response = $this
            ->withToken($currentToken->plainTextToken)
            ->postJson('/api/logout');

        $response->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $currentToken->accessToken->id,
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $otherToken->accessToken->id,
        ]);

        $this->withToken($otherToken->plainTextToken)
            ->getJson('/api/user')
            ->assertOk();
    }
}
