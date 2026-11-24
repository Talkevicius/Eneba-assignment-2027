<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.offer_id' => ['required', 'integer', 'distinct', 'exists:offers,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
