<?php
declare(strict_types=1);

namespace app\middleware;

use Closure;
use think\Request;
use think\Response;

class AdminCheck
{
    public function handle(Request $request, Closure $next): Response
    {
        $role = session('role');

        if ($role !== 'admin') {
            return response('无权访问', 403);
        }

        return $next($request);
    }
}