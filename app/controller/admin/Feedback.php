<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\Feedback as FeedbackModel;
use think\facade\View;

class Feedback extends BaseAdmin
{
    public function index()
    {
        $feedbacks = FeedbackModel::with(['user'])
            ->order('id', 'desc')
            ->paginate(15);

        View::assign('feedbacks', $feedbacks);
        return View::fetch();
    }

    public function reply($id)
    {
        $feedback = FeedbackModel::find($id);

        if (!$feedback) {
            return redirect('/admin/feedbacks')->with('error', '反馈不存在');
        }

        if ($this->request->isPost()) {
            $replyContent = $this->request->post('reply', '');

            if (empty($replyContent)) {
                return redirect('/admin/feedback/reply/' . $id)->with('error', '回复内容不能为空');
            }

            $feedback->save([
                'reply'      => $replyContent,
                'replied_by' => session('user_id'),
                'replied_at' => date('Y-m-d H:i:s'),
                'status'     => 1,
            ]);

            return redirect('/admin/feedbacks')->with('success', '已回复该反馈');
        }

        View::assign('feedback', $feedback);
        return View::fetch();
    }

    public function close($id)
    {
        $feedback = FeedbackModel::find($id);

        if (!$feedback) {
            return redirect('/admin/feedbacks')->with('error', '反馈不存在');
        }

        $feedback->save(['status' => 2]);

        return redirect('/admin/feedbacks')->with('success', '反馈已关闭');
    }
}