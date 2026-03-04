<?php

return [
    'gateway' => env('PAYMENT_GATEWAY', 'simulation'),

    'currency' => env('PAYMENT_CURRENCY', 'PHP'),
];