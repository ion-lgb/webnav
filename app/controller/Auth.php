<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\User;
use think\facade\View;

class Auth extends BaseController
{
    public function login()
    {
        if ($this->request->isGet()) {
            return View::fetch();
        }

        $username = $this->request->post('username', '');
        $password = $this->request->post('password', '');

        if (empty($username) || empty($password)) {
            View::assign('error', '用户名和密码不能为空');
            return View::fetch();
        }

        $user = User::where('username', $username)->find();

        if (!$user || !password_verify($password, $user->password)) {
            View::assign('error', '用户名或密码错误');
            return View::fetch();
        }

        if ($user->status != 1) {
            View::assign('error', '账号已被禁用');
            return View::fetch();
        }

        session('user_id', $user->id);
        session('username', $user->username);
        session('role', $user->role);

        return redirect('/');
    }

    public function register()
    {
        if ($this->request->isGet()) {
            return View::fetch();
        }

        $username = $this->request->post('username', '');
        $email = $this->request->post('email', '');
        $password = $this->request->post('password', '');
        $confirmPassword = $this->request->post('confirm_password', '');

        if (empty($username) || empty($email) || empty($password)) {
            View::assign('error', '所有字段都不能为空');
            return View::fetch();
        }

        if ($password !== $confirmPassword) {
            View::assign('error', '两次密码输入不一致');
            return View::fetch();
        }

        if (User::where('username', $username)->find()) {
            View::assign('error', '用户名已存在');
            return View::fetch();
        }

        if (User::where('email', $email)->find()) {
            View::assign('error', '邮箱已被注册');
            return View::fetch();
        }

        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'role' => 'user',
            'status' => 1,
        ]);

        session('user_id', $user->id);
        session('username', $user->username);
        session('role', $user->role);

        return redirect('/');
    }

    public function logout()
    {
        session('user_id', null);
        session('username', null);
        session('role', null);
        return redirect('/');
    }
}