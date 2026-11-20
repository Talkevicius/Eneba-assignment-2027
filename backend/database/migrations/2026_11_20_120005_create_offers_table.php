<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('seller_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('platform_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('region_id')->index()->constrained()->restrictOnDelete();
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->char('currency', 3);
            $table->boolean('is_active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
