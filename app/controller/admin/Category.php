<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\Category as CategoryModel;
use app\model\Site;
use think\facade\View;
use think\facade\Db;

class Category extends BaseAdmin
{
    public function index()
    {
        $categories = CategoryModel::order('sort_order', 'asc')->paginate(15);

        foreach ($categories as $cat) {
            $cat->site_count = Site::where('category_id', $cat->id)->count();
            if ($cat->parent_id) {
                $parent = CategoryModel::find($cat->parent_id);
                $cat->parent_name = $parent ? $parent->name : '顶级分类';
            } else {
                $cat->parent_name = '顶级分类';
            }
        }

        View::assign('categories', $categories);
        return View::fetch();
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $data = $this->request->only(['name', 'description', 'parent_id', 'sort_order', 'icon']);

            if (empty($data['name'])) {
                return redirect('/admin/category/add')->with('error', '分类名称不能为空');
            }

            if (!empty($data['parent_id'])) {
                $parent = CategoryModel::find($data['parent_id']);
                if (!$parent) {
                    return redirect('/admin/category/add')->with('error', '父级分类不存在');
                }
            } else {
                $data['parent_id'] = null;
            }

            CategoryModel::create($data);
            return redirect('/admin/categories')->with('success', '分类添加成功');
        }

        $parentCategories = CategoryModel::where('parent_id', null)
            ->order('sort_order', 'asc')
            ->select();

        View::assign('parentCategories', $parentCategories);
        return View::fetch();
    }

    public function edit($id)
    {
        $category = CategoryModel::find($id);

        if (!$category) {
            return redirect('/admin/categories')->with('error', '分类不存在');
        }

        if ($this->request->isPost()) {
            $data = $this->request->only(['name', 'description', 'parent_id', 'sort_order', 'icon']);

            if (empty($data['name'])) {
                return redirect('/admin/category/edit/' . $id)->with('error', '分类名称不能为空');
            }

            if (!empty($data['parent_id'])) {
                if ($data['parent_id'] == $id) {
                    return redirect('/admin/category/edit/' . $id)->with('error', '不能将自身设为父级分类');
                }
            } else {
                $data['parent_id'] = null;
            }

            $category->save($data);
            return redirect('/admin/categories')->with('success', '分类修改成功');
        }

        $parentCategories = CategoryModel::where('parent_id', null)
            ->where('id', '<>', $id)
            ->order('sort_order', 'asc')
            ->select();

        View::assign([
            'category'         => $category,
            'parentCategories' => $parentCategories,
        ]);
        return View::fetch();
    }

    public function delete($id)
    {
        $category = CategoryModel::find($id);

        if (!$category) {
            return redirect('/admin/categories')->with('error', '分类不存在');
        }

        $siteCount = Site::where('category_id', $id)->count();
        if ($siteCount > 0) {
            return redirect('/admin/categories')->with('error', '该分类下还有站点，无法删除');
        }

        $category->delete();
        return redirect('/admin/categories')->with('success', '分类删除成功');
    }
}