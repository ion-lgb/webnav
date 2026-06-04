<?php
declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\Category;
use app\model\Site;
use app\middleware\AuthCheck;
use think\facade\View;
use think\facade\Db;

class My extends BaseController
{
    protected $middleware = [AuthCheck::class];

    public function index()
    {
        $userId = session('user_id');

        $myCategories = Category::where('user_id', $userId)
            ->order('sort_order', 'asc')
            ->select();

        foreach ($myCategories as $category) {
            $category->sites = Site::where('category_id', $category->id)
                ->order('sort_order', 'asc')
                ->select();
        }

        $publicCategories = Category::where('user_id', null)
            ->order('sort_order', 'asc')
            ->select();

        foreach ($publicCategories as $category) {
            $category->sites = Site::where('category_id', $category->id)
                ->where('is_public', 1)
                ->order('sort_order', 'asc')
                ->select();
        }

        View::assign('myCategories', $myCategories);
        View::assign('publicCategories', $publicCategories);
        return View::fetch();
    }

    public function addSite()
    {
        if ($this->request->isGet()) {
            $userId = session('user_id');
            $categories = Category::where('user_id', $userId)
                ->order('sort_order', 'asc')
                ->select();
            View::assign('categories', $categories);
            return View::fetch();
        }

        $userId = session('user_id');
        $data = $this->request->post();

        if (empty($data['title']) || empty($data['url'])) {
            View::assign('error', '网站名称和地址不能为空');
            $categories = Category::where('user_id', $userId)->order('sort_order', 'asc')->select();
            View::assign('categories', $categories);
            return View::fetch('index/my/addSite');
        }

        $categoryId = $data['category_id'] ?? 0;
        $category = Category::find($categoryId);
        if (!$category || $category->user_id != $userId) {
            View::assign('error', '无效的分类');
            $categories = Category::where('user_id', $userId)->order('sort_order', 'asc')->select();
            View::assign('categories', $categories);
            return View::fetch();
        }

        Site::create([
            'title' => $data['title'] ?? '',
            'url' => $data['url'] ?? '',
            'description' => $data['description'] ?? '',
            'category_id' => $categoryId,
            'user_id' => $userId,
            'is_public' => isset($data['is_public']) ? 1 : 0,
            'sort_order' => $data['sort_order'] ?? 0,
            'click_count' => 0,
        ]);

        return redirect('/my');
    }

    public function editSite($id)
    {
        $userId = session('user_id');
        $site = Site::find($id);

        if (!$site || $site->user_id != $userId) {
            return redirect('/my');
        }

        if ($this->request->isGet()) {
            $categories = Category::where('user_id', $userId)
                ->order('sort_order', 'asc')
                ->select();
            View::assign('site', $site);
            View::assign('categories', $categories);
            return View::fetch();
        }

        $data = $this->request->post();

        $categoryId = $data['category_id'] ?? 0;
        $category = Category::find($categoryId);
        if (!$category || $category->user_id != $userId) {
            View::assign('error', '无效的分类');
            $categories = Category::where('user_id', $userId)->order('sort_order', 'asc')->select();
            View::assign('site', $site);
            View::assign('categories', $categories);
            return View::fetch();
        }

        $site->save([
            'title' => $data['title'] ?? $site->title,
            'url' => $data['url'] ?? $site->url,
            'description' => $data['description'] ?? $site->description,
            'category_id' => $categoryId,
            'is_public' => isset($data['is_public']) ? 1 : 0,
            'sort_order' => $data['sort_order'] ?? $site->sort_order,
        ]);

        return redirect('/my');
    }

    public function deleteSite($id)
    {
        $userId = session('user_id');
        $site = Site::find($id);

        if (!$site || $site->user_id != $userId) {
            return redirect('/my');
        }

        $site->delete();
        return redirect('/my');
    }

    public function addCategory()
    {
        $userId = session('user_id');
        $name = $this->request->post('name', '');

        if (empty($name)) {
            return redirect('/my');
        }

        Category::create([
            'name'       => $name,
            'user_id'    => $userId,
            'icon'       => $this->request->post('icon', 'fas fa-folder'),
            'sort_order' => $this->request->post('sort_order', 0),
        ]);

        return redirect('/my');
    }

    public function import()
    {
        if ($this->request->isGet()) {
            $userId = session('user_id');
            $personalCategories = Category::where('user_id', $userId)
                ->order('sort_order', 'asc')
                ->select();
            View::assign('personal_categories', $personalCategories);
            return View::fetch();
        }

        $userId = session('user_id');
        $file = $this->request->file('bookmark_file');

        if (!$file) {
            View::assign('error', '请选择文件');
            return View::fetch();
        }

        $categoryId = (int) $this->request->post('category_id', 0);

        $content = $file->getContent();
        $this->parseBookmarkHtml($content, $userId, $categoryId);

        return redirect('/my');
    }

    private function parseBookmarkHtml(string $content, int $userId, int $categoryId = 0): void
    {
        // If a target category is specified, import all links into it
        if ($categoryId > 0) {
            $category = Category::find($categoryId);
            if (!$category || $category->user_id != $userId) {
                return;
            }
            preg_match_all('/<DT><A\s+([^>]*)>(.*?)<\/A>/i', $content, $links, PREG_SET_ORDER);
            foreach ($links as $link) {
                $attrs = $link[1];
                $title = $link[2];
                preg_match('/HREF\s*=\s*"([^"]+)"/i', $attrs, $urlMatch);
                $url = $urlMatch[1] ?? '';
                if (empty($url)) continue;
                Site::create([
                    'title'       => $title,
                    'url'         => $url,
                    'category_id' => $categoryId,
                    'user_id'     => $userId,
                    'is_public'   => 0,
                    'click_count' => 0,
                ]);
            }
            return;
        }

        preg_match_all('/<DT><H3[^>]*>(.*?)<\/H3>/i', $content, $folders, PREG_OFFSET_CAPTURE);

        $folderPositions = [];
        foreach ($folders[1] as $idx => $match) {
            $folderPositions[] = [
                'name' => $match[0],
                'offset' => $folders[0][$idx][1],
                'full_match_end' => $folders[0][$idx][1] + strlen($folders[0][$idx][0]),
            ];
        }

        $folderPositions[] = ['name' => null, 'offset' => PHP_INT_MAX, 'full_match_end' => PHP_INT_MAX];

        for ($i = 0; $i < count($folderPositions) - 1; $i++) {
            $current = $folderPositions[$i];
            $next = $folderPositions[$i + 1];

            $categoryName = $current['name'];
            $category = Category::create([
                'name' => $categoryName,
                'user_id' => $userId,
                'sort_order' => $i,
            ]);

            $sectionStart = $current['full_match_end'];
            $sectionEnd = $next['offset'];
            $section = substr($content, $sectionStart, $sectionEnd - $sectionStart);

            preg_match_all('/<DT><A\s+([^>]*)>(.*?)<\/A>/i', $section, $links, PREG_SET_ORDER);

            foreach ($links as $link) {
                $attrs = $link[1];
                $title = $link[2];

                preg_match('/HREF\s*=\s*"([^"]+)"/i', $attrs, $urlMatch);
                $url = $urlMatch[1] ?? '';

                if (empty($url)) {
                    continue;
                }

                Site::create([
                    'title' => $title,
                    'url' => $url,
                    'category_id' => $category->id,
                    'user_id' => $userId,
                    'is_public' => 0,
                    'click_count' => 0,
                ]);
            }
        }
    }

    public function export()
    {
        $userId = session('user_id');

        if ($this->request->isGet()) {
            $personalCategories = Category::where('user_id', $userId)
                ->order('sort_order', 'asc')
                ->select();
            View::assign('personal_categories', $personalCategories);
            return View::fetch();
        }

        $categories = Category::where('user_id', $userId)
            ->order('sort_order', 'asc')
            ->select();

        $html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>' . "\n";
        $html .= '<!-- This is an automatically generated file.' . "\n";
        $html .= '     It will be read and overwritten. DO NOT EDIT! -->' . "\n";
        $html .= '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">' . "\n";
        $html .= '<TITLE>Bookmarks</TITLE>' . "\n";
        $html .= '<H1>Bookmarks</H1>' . "\n";
        $html .= '<DL><p>' . "\n";

        foreach ($categories as $category) {
            $sites = Site::where('category_id', $category->id)
                ->order('sort_order', 'asc')
                ->select();

            $html .= '    <DT><H3>' . htmlspecialchars($category->name) . '</H3>' . "\n";
            $html .= '    <DL><p>' . "\n";

            foreach ($sites as $site) {
                $html .= '        <DT><A HREF="' . htmlspecialchars($site->url) . '" ADD_DATE="' . strtotime($site->created_at) . '">' . htmlspecialchars($site->title) . '</A>' . "\n";
            }

            $html .= '    </DL><p>' . "\n";
        }

        $html .= '</DL><p>' . "\n";

        return download($html, 'bookmarks.html');
    }
}