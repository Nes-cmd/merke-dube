<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Exception;
use App\Models\Category;
use App\Models\Shop;

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
        
        // Get categories
        $categories = Category::where('owner_id', $user->works_for)->get();
        
        // Get shops
        $shops = Shop::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('Settings', [
            'workers' => $workers,
            'isOwner' => $user->is_owner,
            'categories' => $categories,
            'shops' => $shops,
        ]);
    }
    
    public function addWorker(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);
        
        $user = auth()->user();
        
        if (!$user->is_owner) {
            return redirect()->back()->with('error', 'Only owners can add team members');
        }
        
        try {
            // Check if user already exists
            $existingUser = User::where('phone_number', $request->phone)->first();
            if ($existingUser && $existingUser->works_for != null) {
                return redirect()->back()->with('error', 'User with this phone is already registered');
            }
            
            // Generate random password
            $password = rand(100000, 999999);
            
            if ($existingUser) {
                // Update existing user
                $existingUser->works_for = $user->works_for;
                $existingUser->is_owner = 0;
                $existingUser->save();
                
                return redirect()->back()->with('message', 'Team member added successfully');
            } else {
                // Create new user
                User::create([
                    'name' => $request->name,
                    'email' => $request->phone . '@example.com', // Generate a placeholder email
                    'phone_number' => $request->phone,
                    'works_for' => $user->works_for,
                    'is_owner' => 0,
                ]);
                
                return redirect()->back()->with('message', 'Team member added successfully');
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

    public function getCategories()
    {
        $user = auth()->user();
        $categories = Category::where('owner_id', $user->works_for)->get();
        
        return $categories;
    }

    public function addCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        
        $user = auth()->user();
        
        Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => $user->works_for,
        ]);
        
        return redirect()->back()->with('message', 'Category added successfully');
    }

    public function deleteCategory($id)
    {
        $user = auth()->user();
        $category = Category::where('id', $id)
            ->where('owner_id', $user->works_for)
            ->firstOrFail();
        
        $category->delete();
        
        return redirect()->back()->with('message', 'Category deleted successfully');
    }

    public function addShop(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'description' => 'nullable|string',
        ]);
        
        Shop::create([
            'name' => $request->name,
            'location' => $request->location,
            'phone' => $request->phone,
            'description' => $request->description,
            'owner_id' => $user->works_for,
            'is_active' => true,
        ]);
        
        return redirect()->back()->with('message', 'Shop added successfully');
    }

    public function deleteShop($id)
    {
        $user = auth()->user();
        $shop = Shop::where('id', $id)
            ->where('owner_id', $user->works_for)
            ->firstOrFail();
        
        // Check if shop has sales
        if ($shop->sales()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete shop with sales history');
        }
        
        $shop->delete();
        
        return redirect()->back()->with('message', 'Shop deleted successfully');
    }
} 