<?php
declare(strict_types=1);

namespace app\model;

use think\Model;
use think\facade\Cache;

class Setting extends Model
{
    protected $name = 'settings';

    protected $autoWriteTimestamp = false;

    /**
     * Get a setting value by key
     */
    public static function getVal(string $key, mixed $default = null): mixed
    {
        $val = self::where('key', $key)->value('value');
        if ($val === null || $val === false) {
            return $default;
        }
        // Try JSON decode for array values
        $decoded = json_decode($val, true);
        return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $val;
    }

    /**
     * Set a setting value by key
     */
    public static function setVal(string $key, mixed $value): void
    {
        $val = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value;

        self::where('key', $key)->find()
            ? self::where('key', $key)->update(['value' => $val])
            : self::create(['key' => $key, 'value' => $val]);

        Cache::delete('site_settings');
    }

    /**
     * Get all settings as key-value array (cached)
     */
    public static function allCached(): array
    {
        $data = Cache::get('site_settings');
        if ($data !== null && $data !== false) {
            return $data;
        }

        $rows = self::select();
        $result = [];
        foreach ($rows as $row) {
            $decoded = json_decode($row->value, true);
            $result[$row->key] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $row->value;
        }

        Cache::set('site_settings', $result, 3600);
        return $result;
    }

    /**
     * Get module order
     */
    public static function getModuleOrder(): array
    {
        $order = self::getVal('module_order', []);
        return is_array($order) ? $order : [];
    }
}
