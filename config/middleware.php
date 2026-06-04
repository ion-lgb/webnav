<?php
return [
    'alias'    => [
        'auth'  => \app\middleware\AuthCheck::class,
        'admin' => \app\middleware\AdminCheck::class,
    ],
    'priority' => [],
];