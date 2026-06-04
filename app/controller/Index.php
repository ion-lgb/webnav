<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Category;
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

            foreach ($sites as $site) {
                if (empty($site->icon_url)) {
                    $parsed = parse_url($site->url);
                    $host = $parsed['host'] ?? '';
                    if (!empty($host)) {
                        $site->icon_url = 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32';
                    }
                }
            }

            $category->sites = $sites;
        }

        View::assign('categories', $categories);
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

        foreach ($sites as $site) {
            if (empty($site->icon_url)) {
                $parsed = parse_url($site->url);
                $host = $parsed['host'] ?? '';
                if (!empty($host)) {
                    $site->icon_url = 'https://www.google.com/s2/favicons?domain=' . $host . '&sz=32';
                }
            }
        }

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

        $site = Site::where('url', $url)->find();

        if ($site) {
            $site->where('id', $site->id)->inc('click_count')->update();
        }

        return redirect($url);
    }
}