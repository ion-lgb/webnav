<?php
use think\facade\Route;

Route::get('/', 'Index/index');
Route::rule('search', 'Index/search');
Route::get('redirect', 'Index/redirect');
Route::get('newest', 'Index/newest');
Route::get('popular', 'Index/popular');

Route::get('api/category/sites', 'Api/categorySites');
Route::get('api/fetch-site-meta', 'Api/fetchSiteMeta');
Route::get('api/search-suggest', 'Api/searchSuggest');

Route::get('bookmarks', 'My/index');

Route::rule('login', 'Auth/login');
Route::rule('register', 'Auth/register');
Route::get('logout', 'Auth/logout');

Route::get('about', 'Page/about');
Route::get('privacy', 'Page/privacy');
Route::rule('feedback', 'Feedback/index');

Route::group('my', function () {
    Route::get('/', 'My/index');
    Route::rule('addSite', 'My/addSite');
    Route::rule('editSite/:id', 'My/editSite');
    Route::post('deleteSite/:id', 'My/deleteSite');
    Route::post('addCategory', 'My/addCategory');
    Route::rule('import', 'My/import');
    Route::rule('export', 'My/export');
    Route::post('reorder', 'My/reorder');
})->middleware(\app\middleware\AuthCheck::class);

Route::group('admin', function () {
    Route::get('/', 'admin.Index/index');

    Route::get('categories', 'admin.Category/index');
    Route::rule('category/add', 'admin.Category/add');
    Route::rule('category/edit/:id', 'admin.Category/edit');
    Route::post('category/delete/:id', 'admin.Category/delete');
    Route::post('categories/batch-delete', 'admin.Category/batchDelete');

    Route::get('sites', 'admin.Site/index');
    Route::rule('site/add', 'admin.Site/add');
    Route::rule('site/edit/:id', 'admin.Site/edit');
    Route::post('site/delete/:id', 'admin.Site/delete');
    Route::post('sites/batch-delete', 'admin.Site/batchDelete');

    Route::get('users', 'admin.User/index');
    Route::rule('user/edit/:id', 'admin.User/edit');
    Route::post('user/delete/:id', 'admin.User/delete');
    Route::post('user/toggleStatus/:id', 'admin.User/toggleStatus');
    Route::post('users/batch-delete', 'admin.User/batchDelete');

    Route::get('stats', 'admin.Stats/index');

    Route::get('pages', 'admin.Page/index');
    Route::rule('page/edit/:id', 'admin.Page/edit');

    Route::get('settings', 'admin.Setting/index');
    Route::post('settings/save', 'admin.Setting/save');

    Route::get('feedbacks', 'admin.Feedback/index');
    Route::rule('feedback/reply/:id', 'admin.Feedback/reply');
    Route::post('feedback/close/:id', 'admin.Feedback/close');
    Route::post('feedbacks/batch-close', 'admin.Feedback/batchClose');
})->middleware([\app\middleware\AuthCheck::class, \app\middleware\AdminCheck::class]);