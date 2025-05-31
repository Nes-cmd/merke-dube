<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function redirect()
    {

        $query = http_build_query(
            array(
                'client_id' => env('SISO_CLIENT_ID'),
                'redirect_uri' => url('/') . "/auth/callback",
                'response_type' => 'code',
                'scope' => '',
            )
        );

        return Inertia::location(env('SISO_AUTH_URL') . '/oauth/authorize?' . $query);
    }

    public function callback(Request $request)
    {

        if (isset($request->code) && $request->code) {
            $response = Http::post(env('SISO_AUTH_URL') . '/oauth/token', [
                'grant_type' => 'authorization_code',
                'client_id' => env('SISO_CLIENT_ID'),
                'client_secret' => env('SISO_CLIENT_SECRET'),
                'redirect_uri' => url('/') . "/auth/callback",
                'code' => $request->code,
            ]);
            $response = $response->json();

            // check if the response includes access_token 
            if (isset($response['access_token']) && $response['access_token']) {
                // you would like to store the access_token in the session though... 
                $access_token = $response['access_token'];

                session()->put('access_token', $access_token);

                // use above token to make further api calls in this session or until the access token expires 
                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                    'Authorization' => 'Bearer ' . $access_token
                ])->get(env('SISO_AUTH_URL') . '/api/user/get');

                $user = User::where('siso_id', $response['id'])->first();
                if ($user == null) {
                    $user = User::create([
                        'siso_id' => $response['id'],
                        'name' => $response['name'],
                        'email' => $response['email'],
                        'phone' => $response['phone'],
                    ]);

                    // Self owner
                    $owner = Owner::create([
                        'admin_id' => $user->id,
                        'name' => "{$user->name}'s Store",
                        'phone_number' => $user->phone,
                        'profile' => $response['profile']??null,
                    ]);
                    $user->works_for = $owner->id;
                    $user->is_owner = true;
                    $user->save();
                }

                Auth::login($user); // login user

                // loadSettings($user); // setting to session

                // $locale = settingValue(SettingsEnum::DEFAULT_LANGUAGE);
                // $availableCodes = collect(config('translation-manager.available_locales'))->pluck('code')->toArray();
                // if (in_array($locale, $availableCodes)) request()->session()->put('language', $locale);

                return redirect('/dashboard');
            } else {
                // for some reason, the access_token was not available 
                // debugging goes here 
                return 'for some reason, the access_token was not available';
            }
        }
    }
    public function redirectToDashboard()
    {
        // $user = Auth::user();

        // recordStats(['clicks']);
        // if (!$user) {
        //     return redirect('/');
        // }

        // if ($user->hasRole(RoleEnum::SUPER_ADMIN->name) || $user->email == 'nesrusadik0@gmail.com') {
        //     return redirect('app');
        // }

        return redirect('admin');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Inertia::location(env('SISO_AUTH_URL') . "/logout-sso-client?callback=" . url('/'));
    }
}
