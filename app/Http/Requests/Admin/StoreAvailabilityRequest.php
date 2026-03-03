<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvailabilityRequest extends FormRequest
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
            'availabilities'               => ['required', 'array'],
            'availabilities.*.day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'availabilities.*.start_time'  => ['required', 'date_format:H:i'],
            'availabilities.*.end_time'    => ['required', 'date_format:H:i', 'after:availabilities.*.start_time'],
            'availabilities.*.is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'availabilities.*.start_time.date_format' => 'Start time must be in HH:MM format.',
            'availabilities.*.end_time.date_format'   => 'End time must be in HH:MM format.',
            'availabilities.*.end_time.after'         => 'End time must be after start time.',
        ];
    }
}
