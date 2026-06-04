<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\middleware\AuthCheck;
use app\middleware\AdminCheck;
use think\facade\View;
use think\facade\Db;

class Stats extends BaseAdmin
{
    protected $middleware = [AuthCheck::class, AdminCheck::class];

    public function index()
    {
        $topSites = Db::name('sites')
            ->alias('s')
            ->field('s.id, s.title, s.url, s.click_count, c.name as category_name')
            ->leftJoin('categories c', 's.category_id = c.id')
            ->order('s.click_count', 'desc')
            ->limit(30)
            ->select();

        $categoryClicks = Db::name('sites')
            ->alias('s')
            ->field('c.name as category_name, SUM(s.click_count) AS total_clicks')
            ->leftJoin('categories c', 's.category_id = c.id')
            ->group('s.category_id')
            ->order('total_clicks', 'desc')
            ->select();

        $dailyTrends = Db::name('click_logs')
            ->field('DATE(created_at) AS date, COUNT(*) AS click_count')
            ->whereTime('created_at', 'between', [date('Y-m-d', strtotime('-30 days')), date('Y-m-d')])
            ->group('DATE(created_at)')
            ->order('date', 'asc')
            ->select();

        View::assign([
            'topSites'       => $topSites,
            'categoryStats'  => $categoryClicks,
            'dailyStats'     => $dailyTrends,
        ]);

        return View::fetch();
    }
}