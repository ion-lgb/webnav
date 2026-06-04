<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\Page as PageModel;
use app\middleware\AuthCheck;
use app\middleware\AdminCheck;
use think\facade\View;

class Page extends BaseAdmin
{
    protected $middleware = [AuthCheck::class, AdminCheck::class];

    public function index()
    {
        $pages = PageModel::order('id', 'asc')->select();
        View::assign('pages', $pages);
        return View::fetch();
    }

    public function edit($id)
    {
        $page = PageModel::find($id);

        if (!$page) {
            return redirect('/admin/pages')->with('error', '页面不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->only(['title', 'content']);

            if (empty($data['title'])) {
                return redirect('/admin/page/edit/' . $id)->with('error', '标题不能为空');
            }

            // HTMLPurifier XSS filtering
            $config = \HTMLPurifier_Config::createDefault();
            $config->set('HTML.Allowed', 'p,h1,h2,h3,h4,ul,ol,li,a[href|target],strong,em,blockquote,code,pre,br,hr');
            $config->set('HTML.TargetBlank', true);
            $purifier = new \HTMLPurifier($config);
            $data['content'] = $purifier->purify($data['content']);

            $data['updated_by'] = session('user_id');
            $page->save($data);

            return redirect('/admin/pages')->with('success', '页面已更新');
        }

        View::assign('page', $page);
        return View::fetch();
    }
}