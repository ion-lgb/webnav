<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class Site extends Model
{
    protected $name = 'sites';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';

    public function getIsPublicTextAttr($value, $data)
    {
        $map = [1 => '公开', 0 => '私有'];
        return $map[$data['is_public']] ?? '';
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function resolveFavicon(string $url): string
    {
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';
        $scheme = $parsed['scheme'] ?? 'https';
        if (empty($host)) return '';

        $directUrl = $scheme . '://' . $host . '/favicon.ico';
        $ch = curl_init($directUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 2,
            CURLOPT_TIMEOUT        => 3,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_NOBODY         => true,
        ]);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 400) {
            return $directUrl;
        }

        return 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32';
    }
}