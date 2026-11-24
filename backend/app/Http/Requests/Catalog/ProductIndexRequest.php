<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProductIndexRequest extends FormRequest
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
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'category' => ['sometimes', 'nullable', 'string', 'exists:categories,slug'],
            'platform' => ['sometimes', 'nullable', 'string', 'exists:platforms,slug'],
            'region' => ['sometimes', 'nullable', 'string', 'exists:regions,code'],
            'min_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'sort' => ['sometimes', 'nullable', 'string', 'in:title,price_asc,price_desc'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->has('min_price') || $validator->errors()->has('max_price')) {
                return;
            }

            $minimum = $this->input('min_price');
            $maximum = $this->input('max_price');

            if ($minimum !== null && $maximum !== null && (float) $maximum < (float) $minimum) {
                $validator->errors()->add('max_price', 'The max price must be greater than or equal to the min price.');
            }
        }];
    }
}
