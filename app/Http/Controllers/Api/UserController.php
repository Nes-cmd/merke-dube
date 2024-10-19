<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployerRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public function register() {}

    public function workers()
    {
        $workers = User::all();
        return $workers;
    }

    public function addWorker(EmployerRequest $request)
    {

        $password = rand(1000000, 999999);
        $data = $request->all();
        $data['phone'] = trimPhone($data['phone']);
        $data['authwith'] = 'phone';
        $data['country_id'] = 1;
        $data['password'] = $password;
        $data['password_confirmation'] = $password;

        try {
            $user = User::where('phone_number', $data['phone'])->first();
            if ($user && $user->works_for != null) {
                throw new Exception('User with this phone is registered before, please use another phone number');
            }

            $response = Http::withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
            ])->post(env('SISO_AUTH_URL') . '/api/create-user', $data);

            $payload = $response->json();
            return $response->body();
            if ($payload['status'] == 'success') {
                $ssoUser =  $payload['user'];

                $user = User::create([
                    'siso_id' => $ssoUser['id'],
                    'name' => $ssoUser['name'],
                    'email' => $ssoUser['email'],
                    'phone_number' => $ssoUser['phone'],
                    'works_for' => auth()->user()->works_for,
                ]);


                return response($user, 201);
            }
            throw new Exception($response['message'] ?? 'Unknown error has occured');
        } catch (Exception $e) {
            return response([
                'message' => $e->getMessage(),
                'errors' => [],
            ], 422);
        }
    }

    public function removeWorker() {}
}
