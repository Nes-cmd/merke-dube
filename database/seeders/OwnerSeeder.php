<?php

namespace Database\Seeders;

use App\Models\Owner;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch the user who will be made an owner
        $user = User::create([
            'name' => 'Tofik Munteka',
            'email' => 'tofa@gmail.com',
            'password' => bcrypt('password'), // Use a secure password
            'phone_number' => '0940437595',
            'works_for' => null, // This can be null if not working for anyone yet
        ]);

        // Create an owner linked to the user

        $owner = Owner::create([
            'name' => $user->name,
            'phone_number' => $user->phone_number,
            'admin_id' => $user->id, // Or specify an admin ID if needed
        ]);

        // Update the user to reflect the ownership
        $user->update(['works_for' => $user->id]);
    }
}
