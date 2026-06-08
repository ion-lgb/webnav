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
            ->select();

        $data = [];
        foreach ($sites as $site) {
            $item = $site->toArray();
            if (empty($item['icon_url'])) {
                $item['icon_url'] = Site::resolveFavicon($item['url'] ?? '');
            }
            $data[] = $item;
        }

        return json(['code' => 0, 'data' => $data]);
    }

    public function fetchSiteMeta()
    {
        $url = request()->param('url', '');

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $url)) {
            return json(['code' => 1, 'msg' => '无效的网址格式']);
        }

        $html = $this->httpGet($url);
        if ($html === false) {
            return json(['code' => 1, 'msg' => '无法访问该网站']);
        }

        $title = '';
        $description = '';
        $iconUrl = '';

        preg_match('#<title[^>]*>(.*?)</title>#is', $html, $titleMatch);
        if (!empty($titleMatch[1])) {
            $title = html_entity_decode(trim($titleMatch[1]), ENT_QUOTES, 'UTF-8');
        }

        preg_match('#<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']#is', $html, $descMatch);
        if (empty($descMatch)) {
            preg_match('#<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']#is', $html, $descMatch);
        }
        if (!empty($descMatch[1])) {
            $description = html_entity_decode(trim($descMatch[1]), ENT_QUOTES, 'UTF-8');
        }

        preg_match('#<link\s+[^>]*rel=["\'](?:shortcut\s+)?icon["\'][^>]*href=["\']([^"\']+)["\']#is', $html, $iconMatch);
        if (empty($iconMatch)) {
            preg_match('#<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\'](?:shortcut\s+)?icon["\']#is', $html, $iconMatch);
        }
        if (!empty($iconMatch[1])) {
            $iconUrl = $iconMatch[1];
            if (!preg_match('#^https?://#i', $iconUrl)) {
                $parsed = parse_url($url);
                $base = $parsed['scheme'] . '://' . $parsed['host'];
                $iconUrl = $base . '/' . ltrim($iconUrl, '/');
            }
        }

        if (empty($iconUrl)) {
            $parsed = parse_url($url);
            $iconUrl = 'https://www.google.com/s2/favicons?domain=' . ($parsed['host'] ?? '') . '&sz=32';
        }

        return json([
            'code' => 0,
            'data' => [
                'title'       => $title,
                'description' => $description,
                'icon_url'    => $iconUrl,
            ],
        ]);
    }

    public function searchSuggest()
    {
        $keyword = request()->param('keyword', '');
        $keyword = trim($keyword);

        if (mb_strlen($keyword, 'UTF-8') < 1) {
            return json(['code' => 0, 'data' => []]);
        }

        $sites = Site::where('is_public', 1)
            ->where(function ($query) use ($keyword) {
                $query->whereLike('title', '%' . $keyword . '%')
                    ->whereOr('description', 'like', '%' . $keyword . '%');
            })
            ->order('click_count', 'desc')
            ->limit(8)
            ->field('id, title, url, click_count')
            ->select();

        $data = [];
        foreach ($sites as $site) {
            $data[] = [
                'id'    => $site->id,
                'title' => $site->title,
                'url'   => $site->url,
            ];
        }

        return json(['code' => 0, 'data' => $data]);
    }

    private function httpGet(string $url)
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; WebNav/1.0)',
            CURLOPT_HTTPHEADER     => ['Accept: text/html'],
        ]);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        return ($httpCode >= 200 && $httpCode < 400) ? $result : false;
    }
}
