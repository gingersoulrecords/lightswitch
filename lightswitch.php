<?php
/**
 * Plugin Name: Lightswitch
 * Plugin URI: https://lightswitchwp.com/
 * Description: Simple CSS utilities for toggling/persisting custom body classes (e.g. light, dark).
 * Version: 1.0.0
 * Author: Dave Bloom
 * Author URI: https://davebloom.co
 * License: GPLv2 or later
 */



namespace WP_LightSwitch;

const GINGERSOUL_LIGHTSWITCH_VERSION = '1.0.0';


class WP_LightSwitch
{
    private $cookiesDeleted = false;

    public function __construct()
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_filter('body_class', array($this, 'body_class'));
    }

    public function enqueue_scripts()
    {
        wp_enqueue_script('jquery');
        wp_enqueue_script('wp-lightswitch', plugin_dir_url(__FILE__) . 'js/wp-lightswitch.js', array('jquery'), time(), true);
    }

    public function delete_mode_cookie()
    {
        $this->cookiesDeleted = true;

        foreach ($_COOKIE as $key => $value) {
            if (strpos($key, 'ls-') === 0) {
                setcookie($key, '', time() - 3600, '/');
                unset($_COOKIE[$key]);
            }
        }
    }

    public function body_class($classes)
    {
        if ($this->cookiesDeleted) {
            return $classes;
        }

        foreach ($_COOKIE as $key => $value) {
            if (strpos($key, 'ls-') === 0) {
                $switchName = substr($key, 3);
                if (strpos($value, '|') !== false) {
                    list($originalMode, $mode) = explode('|', $value);
                } else {
                    $originalMode = $mode = $value;
                }

                $classes[] = $mode;
                $classes[] = 'ls-' . $switchName . '-added-' . $originalMode;
                $classes[] = 'ls-' . $switchName . '-evaluatedmode-' . $mode; // Add the new class

            }
        }

        return $classes;
    }
}

new WP_LightSwitch();
