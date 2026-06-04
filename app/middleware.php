<?php
return [
    \think\middleware\SessionInit::class,
    \app\middleware\VerifyCsrf::class,
];
