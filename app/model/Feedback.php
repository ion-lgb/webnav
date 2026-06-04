<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class Feedback extends Model
{
    protected $name = 'feedbacks';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function replier()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    public function getStatusTextAttr($value, $data)
    {
        $map = [0 => '未回复', 1 => '已回复', 2 => '已关闭'];
        return $map[$data['status']] ?? '';
    }
}