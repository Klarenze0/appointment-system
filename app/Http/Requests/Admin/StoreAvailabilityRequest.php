<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'availabilities'             => ['required', 'array'],
            'availabilities.*.date'       => ['required', 'date', 'after_or_equal:today'],
            'availabilities.*.start_time' => ['required', 'date_format:H:i'],
            'availabilities.*.end_time'   => ['required', 'date_format:H:i', 'after:availabilities.*.start_time'],
            'availabilities.*.is_active'  => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'availabilities.*.date.after_or_equal' => 'Date must be today or in the future.',
            'availabilities.*.end_time.after'       => 'End time must be after start time.',
        ];
    }
}