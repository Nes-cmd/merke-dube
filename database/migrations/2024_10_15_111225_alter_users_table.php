<?php

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
        Schema::table('users', function (Blueprint $table){
            $table->string('siso_id');
            $table->string('password')->nullable()->change();
            $table->string('email')->nullable()->change();

            $table->timestamp('phone_verified_at')->nullable();
            $table->boolean('is_owner')->default(1);
            $table->boolean('has_subscribed')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table){
            $table->dropColumn('siso_id');

            $table->dropColumn('phone_verified_at')->nullable();
            $table->dropColumn('is_owner')->default(1);
            $table->dropColumn('has_subscribed')->default(0);
        });
    }
};
