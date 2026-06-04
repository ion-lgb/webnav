<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class Category extends Model
{
    protected $name = 'categories';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';

    public function getIsPublicAttr($value, $data)
    {
        return $data['user_id'] === null;
    }

    public function sites()
    {
        return $this->hasMany(Site::class, 'category_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }
}