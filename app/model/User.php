<?php
declare(strict_types=1);

namespace app\model;

use think\Model;

class User extends Model
{
    protected $name = 'users';

    protected $autoWriteTimestamp = true;

    protected $createTime = 'created_at';

    protected $updateTime = 'updated_at';

    public function getStatusTextAttr($value, $data)
    {
        $status = [1 => '启用', 0 => '禁用'];
        return $status[$data['status']] ?? '';
    }

    public function getRoleTextAttr($value, $data)
    {
        $roles = ['admin' => '管理员', 'user' => '普通用户'];
        return $roles[$data['role']] ?? '';
    }

    public function setPasswordAttr($value)
    {
        return password_hash($value, PASSWORD_BCRYPT);
    }

    public function sites()
    {
        return $this->hasMany(Site::class, 'user_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'user_id');
    }
}