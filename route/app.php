<?php
use think\facade\Route;

Route::get('/', 'Index/index');
Route::rule('search', 'Index/search');
Route::get('redirect', 'Index/redirect');

Route::rule('login', 'Auth/login');
Route::rule('register', 'Auth/register');
Route::get('logout', 'Auth/logout');

Route::group('my', function () {
    Route::get('/', 'My/index');
    Route::rule('addSite', 'My/addSite');
    Route::rule('editSite/:id', 'My/editSite');
    Route::post('deleteSite/:id', 'My/deleteSite');
    Route::post('addCategory', 'My/addCategory');
    Route::rule('import', 'My/import');
    Route::get('export', 'My/export');
})->middleware(\app\middleware\AuthCheck::class);

Route::group('admin', function () {
    Route::get('/', 'admin.Index/index');

    Route::get('categories', 'admin.Category/index');
    Route::rule('category/add', 'admin.Category/add');
    Route::rule('category/edit/:id', 'admin.Category/edit');
    Route::post('category/delete/:id', 'admin.Category/delete');

    Route::get('sites', 'admin.Site/index');
    Route::rule('site/add', 'admin.Site/add');
    Route::rule('site/edit/:id', 'admin.Site/edit');
    Route::post('site/delete/:id', 'admin.Site/delete');

    Route::get('users', 'admin.User/index');
    Route::rule('user/edit/:id', 'admin.User/edit');
    Route::post('user/delete/:id', 'admin.User/delete');
    Route::post('user/toggleStatus/:id', 'admin.User/toggleStatus');

    Route::get('stats', 'admin.Stats/index');
})->middleware([\app\middleware\AuthCheck::class, \app\middleware\AdminCheck::class]);