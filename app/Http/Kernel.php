<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            // ... existing middleware ...
            \App\Http\Middleware\HandleInertiaRequests::class,
        ],

        // ... other middleware groups ...
    ];

    // ... rest of the class ...
} 