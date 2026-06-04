<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class Page extends Model
{
    protected $name = 'pages';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';
}