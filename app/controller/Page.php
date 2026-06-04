<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Page as PageModel;
use think\facade\View;

class Page extends BaseController
{
    public function about()
    {
        $page = PageModel::where('slug', 'about')->find();
        View::assign([
            'title'     => $page ? $page->title : '关于我们',
            'content'   => $page ? $page->content : '',
            'updated_at' => $page ? $page->updated_at : '',
        ]);
        return View::fetch('index/page');
    }

    public function privacy()
    {
        $page = PageModel::where('slug', 'privacy')->find();
        View::assign([
            'title'     => $page ? $page->title : '隐私政策',
            'content'   => $page ? $page->content : '',
            'updated_at' => $page ? $page->updated_at : '',
        ]);
        return View::fetch('index/page');
    }
}