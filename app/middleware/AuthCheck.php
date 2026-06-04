<?php
declare(strict_types=1);

namespace app\middleware;

use Closure;
use think\Request;
use think\Response;

class AuthCheck
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = session('user_id');

        if (!$userId) {
            return redirect('/login');
        }

        return $next($request);
    }
}