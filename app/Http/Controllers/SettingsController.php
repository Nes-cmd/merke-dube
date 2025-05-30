<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Exception;

class SettingsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get workers if the user is an owner
        $workers = [];
        if ($user->is_owner) {
            $workers = User::where('works_for', $user->works_for)
                ->where('id', '!=', $user->id)
                ->get();
        }
        
        return Inertia::render('Settings', [
            'workers' => $workers,
            'isOwner' => $user->is_owner,
        ]);
    }
    
    public function addWorker(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);
        
        $user = auth()->user();
        
        if (!$user->is_owner) {
            return redirect()->back()->with('error', 'Only owners can add workers');
        }
        
        try {
            // Check if user already exists
            $existingUser = User::where('phone_number', $request->phone)->first();
            if ($existingUser && $existingUser->works_for != null) {
                return redirect()->back()->with('error', 'User with this phone is already registered');
            }
            
            // Generate random password
            $password = rand(100000, 999999);
            
            // Prepare data for SSO service
            $data = [
                'name' => $request->name,
                'phone' => $request->phone,
                'email' => $request->email,
                'authwith' => 'phone',
                'country_id' => 1,
                'password' => $password,
                'password_confirmation' => $password,
            ];
            
            // Call SSO service (this is a placeholder, you would implement your actual SSO integration)
            // For now, we'll just create the user directly
            if ($existingUser) {
                // Update existing user
                $existingUser->works_for = $user->works_for;
                $existingUser->is_owner = 0;
                $existingUser->save();
                
                return redirect()->back()->with('message', 'Worker added successfully');
            } else {
                // Create new user
                User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone_number' => $request->phone,
                    'works_for' => $user->works_for,
                    'is_owner' => 0,
                ]);
                
                return redirect()->back()->with('message', 'Worker added successfully');
            }
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
    
    public function removeWorker(Request $request, $id)
    {
        $user = auth()->user();
        
        if (!$user->is_owner) {
            return redirect()->back()->with('error', 'Only owners can remove workers');
        }
        
        $worker = User::findOrFail($id);
        
        if ($worker->works_for !== $user->works_for) {
            return redirect()->back()->with('error', 'You can only remove your own workers');
        }
        
        $worker->works_for = null;
        $worker->save();
        
        return redirect()->back()->with('message', 'Worker removed successfully');
    }
    
    public function updateLanguage(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|in:en,am',
        ]);
        
        return redirect()->back()->with('message', 'Language updated successfully');
    }
} 