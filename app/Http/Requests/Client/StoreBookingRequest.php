<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isClient();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'staff_id'   => ['required', 'integer', 'exists:staff_profiles,id'],
            'starts_at'  => ['required', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'starts_at.after' => 'Appointment must be scheduled in the future.',
        ];
    }
}
