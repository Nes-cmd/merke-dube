<?php

use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->string('photo')->nullable();
            $table->string('status')->default(PaymentStatus::Pending->value);

            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('subcategory_id')->nullable();
            $table->unsignedBigInteger('store_id');
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity')->default(0);
            $table->text('remark')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->cascadeOnDelete();

            // For batch tracking
            $table->string('sku')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('code')->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            // For refill tracking
            $table->integer('refill_count')->default(0);
            $table->timestamp('last_refill_date')->nullable();

            // Foreign key constraints
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('set null');
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            $table->foreign('owner_id')->references('id')->on('owners')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('items');
    }
}
