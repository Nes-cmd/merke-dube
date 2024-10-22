<?php

use App\Models\Owner;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('credit_histories', function (Blueprint $table) {
            $table->id();
            $table->string('creditable_type');
            $table->string('creditable_id');
            $table->double('value');
            $table->foreignIdFor(User::class, 'approver_id')->nullable();
            $table->foreignIdFor(Owner::class);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_histories');
    }
};
