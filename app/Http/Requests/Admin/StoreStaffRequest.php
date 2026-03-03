<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', Password::min(8)->mixedCase()->numbers()],
            'bio'        => ['nullable', 'string', 'max:2000'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'is_active'  => ['boolean'],
            'service_ids'   => ['nullable', 'array'],
            'service_ids.*' => ['integer', 'exists:services,id'],
        ];
    }
}
