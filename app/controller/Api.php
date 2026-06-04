<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Category;
use app\model\Site;

class Api extends BaseController
{
    public function categorySites()
    {
        $categoryId = (int) request()->param('id', 0);
        if (empty($categoryId)) {
            return json(['code' => 1, 'msg' => '缺少分类ID']);
        }

        $category = Category::find($categoryId);
        if (!$category) {
            return json(['code' => 1, 'msg' => '分类不存在']);
        }

        $sites = Site::where('category_id', $categoryId)
            ->where('is_public', 1)
            ->order('sort_order', 'asc')
            ->select()
            ->toArray();

        return json(['code' => 0, 'data' => $sites]);
    }
}
