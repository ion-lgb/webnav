<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\Site as SiteModel;
use app\model\Category;
use app\model\User;
use app\middleware\AuthCheck;
use app\middleware\AdminCheck;
use think\facade\View;

class Site extends BaseAdmin
{
    protected $middleware = [AuthCheck::class, AdminCheck::class];

    public function index()
    {
        $searchTitle = $this->request->param('title', '');
        $searchUrl = $this->request->param('url', '');

        $sites = SiteModel::with(['category', 'user'])
            ->order('id', 'desc');

        if (!empty($searchTitle)) {
            $sites->whereLike('title', '%' . $searchTitle . '%');
        }
        if (!empty($searchUrl)) {
            $sites->whereLike('url', '%' . $searchUrl . '%');
        }

        $sites = $sites->paginate(15);

        foreach ($sites as $site) {
            $site->category_name = $site->category ? $site->category->name : '未分类';
            $site->username = $site->user ? $site->user->username : '-';
        }

        $categories = Category::order('sort_order', 'asc')->select();

        View::assign([
            'sites'      => $sites,
            'categories' => $categories,
            'searchTitle' => $searchTitle,
            'searchUrl'   => $searchUrl,
        ]);
        return View::fetch();
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->only(['title', 'url', 'description', 'category_id', 'user_id', 'is_public', 'sort_order']);

            if (empty($data['title']) || empty($data['url'])) {
                return redirect('/admin/site/add')->with('error', '站点名称和URL不能为空');
            }

            $parsed = parse_url($data['url']);
            $host = $parsed['host'] ?? '';
            if (!empty($host)) {
                $data['icon_url'] = 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32';
            }

            SiteModel::create($data);
            return redirect('/admin/sites')->with('success', '站点添加成功');
        }

        $categories = Category::where('parent_id', null)
            ->order('sort_order', 'asc')
            ->select();

        $users = User::where('status', 1)->select();

        View::assign([
            'categories' => $categories,
            'users'      => $users,
        ]);
        return View::fetch();
    }

    public function edit($id)
    {
        $site = SiteModel::find($id);

        if (!$site) {
            return redirect('/admin/sites')->with('error', '站点不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->only(['title', 'url', 'description', 'category_id', 'user_id', 'is_public', 'sort_order']);

            if (empty($data['title']) || empty($data['url'])) {
                return redirect('/admin/site/edit/' . $id)->with('error', '站点名称和URL不能为空');
            }

            $parsed = parse_url($data['url']);
            $host = $parsed['host'] ?? '';
            if (!empty($host)) {
                $data['icon_url'] = 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32';
            }

            SiteModel::update(array_merge($data, ['id' => $id]));
            return redirect('/admin/sites')->with('success', '站点修改成功');
        }

        $categories = Category::where('parent_id', null)
            ->order('sort_order', 'asc')
            ->select();

        $users = User::where('status', 1)->select();

        View::assign([
            'site'       => $site,
            'categories' => $categories,
            'users'      => $users,
        ]);
        return View::fetch();
    }

    public function delete($id)
    {
        $site = SiteModel::find($id);

        if (!$site) {
            return redirect('/admin/sites')->with('error', '站点不存在');
        }

        $site->delete();
        return redirect('/admin/sites')->with('success', '站点删除成功');
    }
}