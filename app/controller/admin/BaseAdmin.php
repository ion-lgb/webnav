<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\BaseController;
use app\model\User;
use think\facade\View;

class BaseAdmin extends BaseController
{
    protected function initialize()
    {
        $userId = session('user_id');
        if ($userId) {
            $admin = User::find($userId);
            View::assign('admin', $admin);
        }
    }
}