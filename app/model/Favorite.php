<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class Favorite extends Model
{
    protected $name = 'favorites';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = false;

    public function site()
    {
        return $this->belongsTo(Site::class, 'site_id');
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