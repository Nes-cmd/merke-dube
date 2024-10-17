<?php

namespace App\Http\Controllers\Api;

use App\Enums\AuthTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $data = $request->all();
        if (isPhoneOrEmail($request->phoneOrEmail) == AuthTypeEnum::Email) {
            $data['authwith'] = 'email';
            $data['email'] = $request->phoneOrEmail;
        } elseif (isPhoneOrEmail($request->phoneOrEmail) == AuthTypeEnum::Phone) {
            $data['authwith'] = 'phone';
            $data['phone'] = $request->phoneOrEmail;
        } else {
            throw new Exception('Input was neither phone nor email');
        }

        $data['from'] = 'ker-wallet';
        $response = Http::post(env('SISO_AUTH_URL') . '/api/ext-login', $data);

        if ($response->status() == 200) {

            $response = $response->json();

            $ssoUser = $response['user'];

            $user = User::where('siso_id', $ssoUser['id'])->first();


            if ($user == null) {
                $user = User::create([
                    'siso_id' => $ssoUser['id'],
                    'name' => $ssoUser['name'],
                    'email' => $ssoUser['email'],
                    'phone' => $ssoUser['phone'],
                ]);
            }

            $tokens = $user->createToken('API-TOKEN');
            // Auth::login($user);

            return response([
                'user' => $user,
                'token' => $tokens->plainTextToken
            ]);
        }
        return response($response->json(), $response->status());
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->all();
        $data['authwith'] = 'phone';
        $data['country_id'] = 1;

        try {
            $response = Http::post(env('SISO_AUTH_URL') . '/api/create-user', $data);

            $payload = $response->json();
            if ($payload['status'] == 'success') {
                $ssoUser =  $payload['user'];

                $user = User::create([
                    'siso_id' => $ssoUser['id'],
                    'name' => $ssoUser['name'],
                    'email' => $ssoUser['email'],
                    'phone' => $ssoUser['phone'],
                ]);

                return response([
                    'user' => $user,
                    'token' => $user->createToken('API-TOKEN')->plainTextToken
                ]);
            }
            throw new Exception($response['message']?? 'Unknown error has occured');

        } catch (Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }
}
