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
}