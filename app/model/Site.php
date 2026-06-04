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

    public function getFaviconAttr($value, $data)
    {
        if (!empty($data['icon_url'])) {
            return $data['icon_url'];
        }
        $parsed = parse_url($data['url'] ?? '');
        $host = $parsed['host'] ?? '';
        return $host ? 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32' : '';
    }
}