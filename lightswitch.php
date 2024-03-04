<?php
/*
Plugin Name: LightSwitch
Description: A plugin to toggle light/dark mode on your WordPress site.
Version: 1.0
Author: Dave Bloom
*/

namespace WP_LightSwitch;

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
                $mode = $value;

                $classes[] = $mode;
                $classes[] = 'ls-' . $switchName . '-added-' . $mode;
            }
        }

        return $classes;
    }
}

new WP_LightSwitch();
