<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'item_id' => 'required',
            'sale_price' => 'required|numeric',
            'quantity_sold' => 'required|numeric',
            'received_price' => 'required|numeric',
            'credit' => 'required|numeric',
            'payment_status' => 'required',
            'note' => 'nullable|max:255'
        ];
    }   
}
