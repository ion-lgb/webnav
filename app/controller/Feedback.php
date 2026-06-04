<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Feedback as FeedbackModel;
use think\facade\View;

class Feedback extends BaseController
{
    public function index()
    {
        if ($this->request->isGet()) {
            return View::fetch('index/feedback');
        }

        $data = $this->request->post();

        if (empty($data['content'])) {
            View::assign('error', '请输入反馈内容');
            return View::fetch('index/feedback');
        }

        $userId = session('user_id');

        FeedbackModel::create([
            'user_id' => $userId,
            'name'    => $data['name'] ?? ($userId ? session('username') : '匿名'),
            'email'   => $data['email'] ?? '',
            'content' => $data['content'],
            'status'  => 0,
        ]);

        View::assign('success', '感谢你的反馈！我们会尽快处理。');
        return View::fetch('index/feedback');
    }
}