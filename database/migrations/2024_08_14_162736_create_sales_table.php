<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('owner_id');
            $table->decimal('sale_price', 10, 2);
            $table->integer('quantity_sold');
            $table->decimal('received_price', 10, 2);
            $table->decimal('credit', 10, 2);
            $table->string('payment_status')->default('Pending');
            $table->timestamp('sold_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
            // Foreign key constraints
            $table->foreignId('approved_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
            $table->foreign('owner_id')->references('id')->on('owners')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales');
    }
}
