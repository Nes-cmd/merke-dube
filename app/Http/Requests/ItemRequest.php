<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ItemRequest extends FormRequest
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
            'name' => 'required|max:255',
            'color' => 'nullable|max:50', 
            'size' => 'nullable|max:50', 
            // 'photo' => 'sometimes|mimes:png,jpg,svg,jpeg,webp,gif',
            'paid' => 'required|numeric', 
            'credit' => 'required|numeric', 
            'category_id' => 'required|numeric', 
            'subcategory_id' => 'nullable|numeric', 
            'store_id' => 'required',
            'unit_price' => 'required',
            'quantity' => 'required',
            'remark' => 'nullable',
            'quantity' => 'required',
        ];
    }
}
