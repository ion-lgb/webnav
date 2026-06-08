<?php
declare(strict_types=1);

namespace app\controller\admin;

use app\controller\admin\BaseAdmin;
use app\model\Setting as SettingModel;
use think\facade\View;
use think\facade\Cache;

class Setting extends BaseAdmin
{
    public function index()
    {
        $settings = SettingModel::allCached();

        $moduleOrder = SettingModel::getModuleOrder();
        if (empty($moduleOrder)) {
            $moduleOrder = ['banner', 'left_sidebar', 'main', 'right_sidebar', 'footer'];
        }

        $modules = [
            'banner'         => ['label' => '搜索 Banner',     'icon' => 'fas fa-search',      'enabled' => ($settings['banner_enabled'] ?? '1') === '1'],
            'left_sidebar'   => ['label' => '左侧分类栏',       'icon' => 'fas fa-list',         'enabled' => ($settings['left_sidebar_enabled'] ?? '1') === '1'],
            'main'           => ['label' => '主体内容区',       'icon' => 'fas fa-th-large',     'enabled' => true],
            'right_sidebar'  => ['label' => '右侧面板',         'icon' => 'fas fa-columns',      'enabled' => ($settings['right_sidebar_enabled'] ?? '1') === '1'],
            'footer'         => ['label' => '页脚',             'icon' => 'fas fa-caret-down',   'enabled' => ($settings['footer_enabled'] ?? '1') === '1'],
        ];

        $sortedModules = [];
        foreach ($moduleOrder as $key) {
            if (isset($modules[$key])) {
                $sortedModules[$key] = $modules[$key];
                $sortedModules[$key]['key'] = $key;
            }
        }
        foreach ($modules as $key => $mod) {
            if (!isset($sortedModules[$key])) {
                $sortedModules[$key] = $mod;
                $sortedModules[$key]['key'] = $key;
            }
        }

        View::assign('theme_color', $settings['theme_color'] ?? '#e8590c');
        View::assign('site_title', $settings['site_title'] ?? 'WebNav');
        View::assign('site_subtitle', $settings['site_subtitle'] ?? '发现优质网站');
        View::assign('modules', $sortedModules);
        View::assign('module_order', $moduleOrder);

        return View::fetch();
    }

    public function save()
    {
        $data = request()->post();

        SettingModel::setVal('theme_color', $data['theme_color'] ?? '#e8590c');
        SettingModel::setVal('site_title', $data['site_title'] ?? 'WebNav');
        SettingModel::setVal('site_subtitle', $data['site_subtitle'] ?? '');

        SettingModel::setVal('banner_enabled', isset($data['banner_enabled']) ? '1' : '0');
        SettingModel::setVal('left_sidebar_enabled', isset($data['left_sidebar_enabled']) ? '1' : '0');
        SettingModel::setVal('right_sidebar_enabled', isset($data['right_sidebar_enabled']) ? '1' : '0');
        SettingModel::setVal('footer_enabled', isset($data['footer_enabled']) ? '1' : '0');

        $orderJson = $data['module_order'] ?? '[]';
        $order = json_decode($orderJson, true);
        if (is_array($order) && !empty($order)) {
            SettingModel::setVal('module_order', $order);
        }

        Cache::delete('site_settings');

        return redirect('/admin/settings')->with('success', '设置已保存');
    }
}
