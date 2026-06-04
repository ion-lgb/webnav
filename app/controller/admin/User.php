<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\User as UserModel;
use think\facade\View;

class User extends BaseAdmin
{
    public function index()
    {
        $users = UserModel::order('id', 'desc')->paginate(15);

        View::assign('users', $users);
        return View::fetch();
    }

    public function edit($id)
    {
        $user = UserModel::find($id);

        if (!$user) {
            return redirect('/admin/users')->with('error', '用户不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->only(['role', 'status', 'email']);

            UserModel::update(array_merge($data, ['id' => $id]));
            return redirect('/admin/users')->with('success', '用户修改成功');
        }

        View::assign('user', $user);
        return View::fetch();
    }

    public function delete($id)
    {
        $currentUserId = $this->request->session()->get('user_id');

        if ($id == $currentUserId) {
            return redirect('/admin/users')->with('error', '不能删除自己');
        }

        $user = UserModel::find($id);

        if (!$user) {
            return redirect('/admin/users')->with('error', '用户不存在');
        }

        $user->delete();
        return redirect('/admin/users')->with('success', '用户删除成功');
    }

    public function toggleStatus($id)
    {
        $user = UserModel::find($id);

        if (!$user) {
            return redirect('/admin/users')->with('error', '用户不存在');
        }

        $currentUserId = $this->request->session()->get('user_id');
        if ($id == $currentUserId) {
            return redirect('/admin/users')->with('error', '不能禁用自己');
        }

        $newStatus = $user->status == 1 ? 0 : 1;
        UserModel::update(['id' => $id, 'status' => $newStatus]);

        return redirect('/admin/users')->with('success', '状态切换成功');
    }

    public function batchDelete()
    {
        $ids = $this->request->post('ids', '');
        if (empty($ids)) return redirect('/admin/users')->with('error', '请选择用户');
        $idArr = array_filter(explode(',', $ids), 'is_numeric');
        $currentUserId = $this->request->session()->get('user_id');
        $idArr = array_filter($idArr, function($id) use ($currentUserId) { return $id != $currentUserId; });
        if (empty($idArr)) return redirect('/admin/users')->with('error', '不能删除自己');
        UserModel::destroy($idArr);
        return redirect('/admin/users')->with('success', '批量删除完成');
    }
}