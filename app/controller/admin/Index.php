<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\User;
use app\model\Category;
use app\model\Site;
use app\model\ClickLog;
use think\facade\View;


class Index extends BaseAdmin
{
    public function index()
    {
        $totalUsers = User::count();
        $totalSites = Site::count();
        $totalCategories = Category::count();
        $todayClicks = ClickLog::where('created_at', '>=', date('Y-m-d 00:00:00'))
            ->where('created_at', '<=', date('Y-m-d 23:59:59'))
            ->count();

        $recentSites = Site::with(['category', 'user'])
            ->order('id', 'desc')
            ->limit(10)
            ->select();

        $topClickedSites = Site::with(['category'])
            ->order('click_count', 'desc')
            ->limit(10)
            ->select();

        $totalClicks = Site::sum('click_count');

        View::assign([
            'totalUsers'      => $totalUsers,
            'totalSites'      => $totalSites,
            'totalCategories' => $totalCategories,
            'todayClicks'     => $todayClicks,
            'totalClicks'     => $totalClicks,
            'recentSites'     => $recentSites,
            'topClickedSites' => $topClickedSites,
        ]);

        return View::fetch();
    }
}