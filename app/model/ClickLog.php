<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class ClickLog extends Model
{
    protected $name = 'click_logs';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = false;
}
