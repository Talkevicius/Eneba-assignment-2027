<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('order_item_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->string('key_code');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_keys');
    }
};
