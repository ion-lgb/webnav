<?php
declare(strict_types=1);

namespace app\middleware;

class VerifyCsrf
{
    protected $except = [
        'feedback',
        'api/',
    ];

    public function handle($request, \Closure $next)
    {
        if ($request->isGet()) {
            return $next($request);
        }

        $path = trim($request->pathinfo(), '/');

        foreach ($this->except as $exclude) {
            if (str_starts_with($path, $exclude)) {
                return $next($request);
            }
        }

        $token = $request->post('__token__', '');
        $sessionToken = session('__token__');

        if (empty($sessionToken)) {
            $sessionToken = bin2hex(random_bytes(32));
            session('__token__', $sessionToken);
        }

        if (!hash_equals($sessionToken, $token)) {
            return response('CSRF token mismatch', 403);
        }

        return $next($request);
    }
}
