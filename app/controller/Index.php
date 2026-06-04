<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Category;
use app\model\ClickLog;
use app\model\Site;
use think\facade\View;
use think\facade\Db;

class Index extends BaseController
{
    public function index()
    {
        $categories = Category::where('user_id', null)
            ->order('sort_order', 'asc')
            ->select();

        foreach ($categories as $category) {
            $sites = Site::where('category_id', $category->id)
                ->where('is_public', 1)
                ->order('sort_order', 'asc')
                ->select();

            $category->sites = $sites;
        }

        View::assign('categories', $categories);
        return View::fetch();
    }

    public function newest()
    {
        $sites = Site::where('is_public', 1)
            ->order('created_at', 'desc')
            ->limit(60)
            ->select();

        View::assign('sites', $sites);
        return View::fetch();
    }

    public function popular()
    {
        $sites = Site::where('is_public', 1)
            ->order('click_count', 'desc')
            ->limit(60)
            ->select();

        View::assign('sites', $sites);
        return View::fetch();
    }

    public function search()
    {
        $keyword = $this->request->param('keyword', '');

        if (empty($keyword)) {
            return redirect('/');
        }

        $sites = Site::where('is_public', 1)
            ->where(function ($query) use ($keyword) {
                $query->whereLike('title', '%' . $keyword . '%')
                    ->whereOr('description', 'like', '%' . $keyword . '%')
                    ->whereOr('url', 'like', '%' . $keyword . '%');
            })
            ->order('click_count', 'desc')
            ->select();

        View::assign('keyword', $keyword);
        View::assign('sites', $sites);
        View::assign('count', count($sites));
        return View::fetch();
    }

    public function redirect()
    {
        $url = $this->request->get('url', '');

        if (empty($url)) {
            return redirect('/');
        }

        $site = Site::where('url', $url)->where('is_public', 1)->find();

        if (!$site) {
            View::assign('targetUrl', $url);
            return View::fetch('index/redirect_confirm');
        }

        $site->inc('click_count')->update();

        ClickLog::create([
            'site_id'  => $site->id,
            'user_id'  => session('user_id'),
            'ip'       => $this->request->ip(),
            'referer'  => $this->request->server('HTTP_REFERER', ''),
        ]);

        return redirect($url);
    }
}