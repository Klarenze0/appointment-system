<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
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
        // staff route parameter is the StaffProfile id
        $staffProfile = $this->route('staff');
        $userId       = $staffProfile->user_id;

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'bio'        => ['nullable', 'string', 'max:2000'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'is_active'  => ['boolean'],
            'service_ids'   => ['nullable', 'array'],
            'service_ids.*' => ['integer', 'exists:services,id'],
        ];
    }
}
