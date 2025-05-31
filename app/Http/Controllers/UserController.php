<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployerRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function register() {}

    public function workers()
    {
        $user = auth()->user();
        $workers = User::where('works_for', $user->works_for)->where('id', '!=', $user->ud)->get();
        return $workers;
    }

    /**
     * Add a new team member with SSO integration
     */
    public function addWorker(Request $request)
    {
        // Validate request
        Log::info('Add worker request:', $request->all());

        if (!auth()->user()->is_owner) {
            return redirect()->back()->with('error', 'Only owners can add team members');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'role' => 'required|in:seller,admin', // Validate role
        ]);

        try {
            // Format the phone number
            $phone = $this->trimPhone($request->phone);
            Log::info('Formatted phone:', ['original' => $request->phone, 'formatted' => $phone]);

            // Check if user already exists locally
            $existingUser = User::where('phone_number', $phone)->first();
            if ($existingUser && $existingUser->works_for !== null) {
                return redirect()->back()->with('error', 'User with this phone is already registered as a team member');
            }

            // If user exists but not working for anyone, update them
            if ($existingUser) {
                $existingUser->works_for = auth()->user()->works_for;
                $existingUser->is_admin = $request->role === 'admin';
                $existingUser->save();
                return redirect()->back()->with('message', 'Team member added successfully');
            }

            // Prepare data for SSO registration
            $password = rand(100000, 999999); // Generate a random 6-digit password
            
            $ssoData = [
                'name' => $request->name,
                'phone' => $phone,
                'email' => $request->email ?: $phone.'@example.com',
                'authwith' => 'phone',
                'country_id' => 1,
                'password' => $password,
                'password_confirmation' => $password,
            ];
            
            Log::info('Sending SSO registration request:', array_merge(
                $ssoData, 
                ['password' => '******', 'password_confirmation' => '******']
            ));

            // Check if SSO URL is configured
            $ssoUrl = env('SISO_AUTH_URL');
            if (!$ssoUrl) {
                Log::error('SISO_AUTH_URL is not configured in .env');
                return redirect()->back()->with('error', 'SSO server configuration is missing');
            }

            // Make request to SSO server
            $response = Http::timeout(30)->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
            ])->post($ssoUrl . '/api/create-user', $ssoData);

            // Log the full response for debugging
            Log::info('SSO response status: ' . $response->status());
            Log::info('SSO response body: ' . $response->body());

            if (!$response->successful()) {
                $errorMessage = 'SSO server returned an error: ';
                
                if ($response->json('message')) {
                    $errorMessage .= $response->json('message');
                } else {
                    $errorMessage .= 'Status code ' . $response->status();
                }
                
                Log::error($errorMessage, ['response' => $response->json()]);
                return redirect()->back()->with('error', $errorMessage);
            }

            $payload = $response->json();

            if (isset($payload['status']) && $payload['status'] == 'success' && isset($payload['user'])) {
                $ssoUser = $payload['user'];
                
                // Create local user with SSO ID
                $user = User::create([
                    'siso_id' => $ssoUser['id'],
                    'name' => $ssoUser['name'],
                    'email' => $ssoUser['email'],
                    'phone_number' => $ssoUser['phone'],
                    'works_for' => auth()->user()->works_for,
                    'is_owner' => 0,
                    // 'is_admin' => $request->role === 'admin', // Set admin status based on role
                ]);

                Log::info('Team member created successfully with SSO ID: ' . $ssoUser['id']);
                
                return redirect()->back()->with([
                    'message' => 'Team member added successfully',
                    'password_info' => "Temporary password: {$password}",
                ]);
            } else {
                $errorMessage = $payload['message'] ?? 'Unknown error occurred during SSO registration';
                Log::error('SSO registration failed', ['payload' => $payload]);
                return redirect()->back()->with('error', $errorMessage);
            }
        } catch (\Exception $e) {
            Log::error('Error adding worker: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to add team member: ' . $e->getMessage());
        }
    }

    /**
     * Format phone number to international format
     */
    private function trimPhone($phone)
    {
        // Remove all non-digit characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // If phone starts with 0, replace with +251
        if (substr($phone, 0, 1) === '0') {
            $phone = '+251' . substr($phone, 1);
        }
        
        // If phone starts with 251 without +, add the +
        if (substr($phone, 0, 3) === '251' && substr($phone, 0, 1) !== '+') {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }

    /**
     * Remove a worker from the team
     */
    public function removeWorker($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Ensure the authenticated user can remove this worker
            if (!auth()->user()->is_owner || $user->works_for !== auth()->user()->works_for) {
                return redirect()->back()->with('error', 'You do not have permission to remove this team member');
            }
            
            $user->works_for = null;
            $user->save();
            
            return redirect()->back()->with('message', 'Team member removed successfully');
        } catch (\Exception $e) {
            Log::error('Error removing worker: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to remove team member');
        }
    }
}
