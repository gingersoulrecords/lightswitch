(function ($) {
    // Create the lightswitch object
    window.lightswitch = {
        // Empty switches array
        switches: [],

        // lightSwitchCookieStorage object
        lightSwitchCookieStorage: {
            setCookie: function setCookie(key, value, time, path) {
                var expires = new Date();
                expires.setTime(expires.getTime() + time);
                var pathValue = '';
                if (typeof path !== 'undefined') {
                    pathValue = 'path=' + path + ';';
                }
                document.cookie = key + '=' + value + ';' + pathValue + 'expires=' + expires.toUTCString();
            },
            getCookie: function getCookie(key) {
                var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
                return keyValue ? keyValue[2] : null;
            },
            removeCookie: function removeCookie(key) {
                document.cookie = key + '=; Max-Age=0; path=/';
            }
        },

        // IndexSwitches method
        indexSwitches: function () {
            console.log('indexSwitches method called')
            var self = this; // Save a reference to the lightswitch object

            // Find each .ls-toggle and .ls-menu element
            $('[class*="ls-toggle-"], [class*="ls-menu-"]').each(function () {
                // Get the class names
                var classNames = $(this).attr('class').split(' ');

                // Find the class that starts with 'ls-'
                var lsClass = classNames.find(function (className) {
                    return className.startsWith('ls-toggle-') || className.startsWith('ls-menu-');
                });

                if (lsClass) {
                    // Extract the switch name and modes from the ls- class
                    var name = lsClass.split('ls-toggle-')[1] || lsClass.split('ls-menu-')[1];
                    var modes = name.split('-');

                    // Add 'color_scheme' to the modes array if it's part of the switch name
                    if (name.includes('color_scheme')) {
                        modes.push('color_scheme');
                    }

                    // Create an object representing the switch
                    var switchObj = {
                        switch: $(this),
                        name: name,
                        modes: modes
                    };

                    // Add the switch object to the switches array
                    self.switches.push(switchObj); // Use self instead of this

                    // If there's no cookie that matches the name of this switch, set the page to the default mode
                    if (!self.lightSwitchCookieStorage.getCookie('ls-' + name)) {
                        var defaultMode = modes[0];
                        self.updateBodyClass(defaultMode, name);
                        // Uncomment the following line to also set the cookie to the switch's default mode
                        // self.setModeCookie(defaultMode, name);
                    }
                }
            });
        },



        // processSwitches method
        processSwitches: function () {
            var self = this;
            this.switches.forEach(function (switchObj) {
                if (switchObj.switch.hasClass('ls-toggle-' + switchObj.name)) {
                    self.processToggles(switchObj);
                } else if (switchObj.switch.hasClass('ls-menu-' + switchObj.name)) {
                    self.processMenus(switchObj);
                }
            });
        },


        // processToggles method
        processToggles: function (switchObj) {
            var self = this; // Save a reference to the lightswitch object

            switchObj.switch.on('click', function () {
                console.log('Toggle switch clicked.');

                const [defaultMode, alternateMode] = switchObj.modes;
                console.log(`Default mode: ${defaultMode}, Alternate mode: ${alternateMode}`);

                const currentMode = $('body').attr('class').match(new RegExp('ls-' + switchObj.name + '-added-\\S+'));
                let currentModeSuffix = '';
                if (currentMode) {
                    currentModeSuffix = currentMode[0].split('-').pop();
                    console.log(`Current mode: ${currentModeSuffix}`);
                    $('body').removeClass(currentModeSuffix);
                    $('body').removeClass(currentMode[0]);
                }

                let newMode = '';
                if (!currentModeSuffix || currentModeSuffix === defaultMode) {
                    console.log('Switching to alternate mode.');
                    newMode = alternateMode;
                } else {
                    console.log('Switching to default mode.');
                    newMode = defaultMode;
                }

                // If the new mode is 'color_scheme', get the mode value from processSystemPreferences
                if (newMode === 'color_scheme') {
                    newMode = self.processSystemPreferences(newMode);
                    console.log(`Processed mode: ${newMode}`);
                }

                self.lightSwitchCookieStorage.removeCookie(switchObj.name);
                self.toggleMode(newMode, switchObj.name);
                self.updateBodyClass(newMode, switchObj.name);

                // Add the new mode class to the body
                $('body').addClass(newMode);
            });
        },

        // processSystemPreferences method
        processSystemPreferences: function (preference) {
            var value;

            switch (preference) {
                case 'color_scheme':
                    // Get the OS's prefers-color-scheme value
                    value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    break;
                // Add more cases here for other user preferences
            }

            // Return the value of the preference
            return value;
        },

        processMenus: function (switchObj) {
            switchObj.switch.find('[class*="ls-mode-"]').on('click', function () {

                // Get the class names
                var classNames = $(this).attr('class').split(' ');

                // Find the class that starts with 'ls-mode-'
                var lsModeClass = classNames.find(function (className) {
                    return className.startsWith('ls-mode-');
                });

                if (lsModeClass) {
                    // Extract the mode from the ls-mode- class
                    var mode = lsModeClass.split('ls-mode-')[1];


                    // Store the original mode before processing it
                    var originalMode = mode;


                    // If the selected mode is 'color_scheme', get the mode value from processSystemPreferences
                    var evaluatedMode;
                    if (mode === 'color_scheme') {
                        evaluatedMode = mode = window.lightswitch.processSystemPreferences(mode);
                        //console.log(`Processed mode: ${mode}`);
                    }

                    // Get the current mode class from the body
                    const currentModeClassArray = $('body').attr('class').match(new RegExp('ls-' + switchObj.name + '-added-\\S+'));

                    // Get the first match as a string
                    const currentModeClass = currentModeClassArray ? currentModeClassArray[0] : null;

                    // Extract the mode from the class name
                    var currentMode = currentModeClass ? currentModeClass.split('-').pop() : null;

                    // If the current mode is the same as the clicked mode, do nothing and return
                    if (currentMode && currentMode === originalMode) {
                        return;
                    }

                    // Get the evaluated mode class from the body as an array
                    const evaluatedModeClassArray = $('body').attr('class').match(new RegExp('ls-' + switchObj.name + '-evaluatedmode-\\S+'));

                    // Get the first match as a string
                    const evaluatedModeClass = evaluatedModeClassArray ? evaluatedModeClassArray[0] : null;

                    // Extract the evaluated mode from the class name
                    var evaluatedMode = evaluatedModeClass ? evaluatedModeClass.split('-').pop() : null;

                    console.log('evaluatedMode', evaluatedMode);

                    if (evaluatedMode) {
                        // Remove the old evaluated mode class and the corresponding mode class
                        $('body').removeClass(evaluatedMode);
                        $('body').removeClass('ls-' + switchObj.name + '-added-' + evaluatedMode);
                        $('body').removeClass('ls-' + switchObj.name + '-evaluatedmode-' + evaluatedMode);
                    }

                    // Set the new mode class and attribute on the body
                    $('body').addClass(mode);
                    $('body').addClass('ls-' + switchObj.name + '-added-' + originalMode);
                    $('body').addClass('ls-' + switchObj.name + '-evaluatedmode-' + mode); // Add the new evaluated mode class

                    // Set the mode cookie
                    window.lightswitch.lightSwitchCookieStorage.setCookie('ls-' + switchObj.name, originalMode + '|' + mode, 2628000000, '/');
                }
            });
        },

        listenForSystemChanges: function () {
            // Create MediaQueryList objects for light and dark modes
            const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

            // Define a callback function to handle changes
            const handleChange = (event) => {
                console.log(`The prefers-color-scheme has changed to ${event.matches ? 'dark' : 'light'}`);

                // Look through the switches to see if any of them have 'color_scheme' as a mode
                $('[class*="ls-mode-"]').each(function () {
                    // Get the class names
                    var classNames = $(this).attr('class').split(' ');

                    // Find the class that starts with 'ls-mode-'
                    var lsModeClass = classNames.find(function (className) {
                        return className.startsWith('ls-mode-');
                    });

                    if (lsModeClass) {
                        // Extract the mode from the ls-mode- class
                        var mode = lsModeClass.split('ls-mode-')[1];

                        // If the mode is 'color_scheme', trigger a click on its ls-mode-color_scheme child
                        if (mode === 'color_scheme') {
                            $(this).find('.ls-mode-color_scheme').trigger('click');
                        }
                    }
                });
            };

            // Add the event listener for both light and dark modes
            prefersColorScheme.addEventListener('change', handleChange);

            // Call the callback function at run time for both light and dark modes
            handleChange(prefersColorScheme);
        },



        // toggleMode method
        toggleMode: function (mode, switchName) {
            // Check if the body has the class
            var hasClass = $('body').hasClass('ls-' + switchName + '-added-' + mode);

            // Toggle the class on the body element
            $('body').toggleClass('ls-' + switchName + '-added-' + mode);

            // If the body had the class, remove the class and the attribute
            // Otherwise, add the class and update the attribute
            if (hasClass) {
                $('body').removeClass('ls-' + switchName + '-added-' + mode);
                this.removeBodyModeClass(switchName);
            } else {
                $('body').addClass('ls-' + switchName + '-added-' + mode);
                this.updateBodyClass(mode, switchName);
            }

            // Call setModeCookie method to set the mode cookie
            this.setModeCookie(mode, switchName);
        },

        // updateBodyClass method
        updateBodyClass: function (newMode, switchName) {
            const oldMode = $('body').attr('class').match(new RegExp('ls-' + switchName + '-added-\\S+'));
            if (oldMode) {
                $('body').removeClass(oldMode[0]);
            }
            $('body').addClass('ls-' + switchName + '-added-' + newMode);

            // Also add the mode as a class
            $('body').addClass(newMode);
        },

        // removeBodyModeClass method
        removeBodyModeClass: function (switchName) {
            const oldMode = $('body').attr('class').match(new RegExp('ls-' + switchName + '-added-\\S+'));
            if (oldMode) {
                $('body').removeClass(oldMode[0]);
            }
        },


        // setModeCookie method
        setModeCookie: function (mode, switchName) {
            // Set a cookie with the prefix 'ls-', the switch name and mode
            this.lightSwitchCookieStorage.setCookie('ls-' + switchName, mode, 2628000000, '/');
            console.log(`Cookie set: ls-${switchName} = ${mode}`);
        },

        // Add this method to your window.lightswitch object
        cleanUpCookies: function () {
            // Get all cookies
            var cookies = document.cookie.split(";");

            // Iterate over each cookie
            cookies.forEach((cookie) => {
                // Extract the cookie name
                var cookieName = cookie.split("=")[0].trim();

                // Check if the cookie name starts with 'ls-'
                if (cookieName.startsWith('ls-')) {
                    // Extract the toggle/menu name from the cookie name
                    var name = cookieName.split('ls-')[1];

                    // Check if there's a corresponding DOM element
                    var domElement = $(`.ls-toggle-${name}, .ls-menu-${name}`);

                    // If there's no corresponding DOM element, remove the cookie
                    if (domElement.length === 0) {
                        this.lightSwitchCookieStorage.removeCookie(cookieName);
                        console.log(`Cookie removed: ${cookieName}`);
                    }
                }
            });
        },


    };


    //init functions
    window.lightswitch.indexSwitches();
    window.lightswitch.processSwitches();
    window.lightswitch.cleanUpCookies();
    //window.lightswitch.listenForSystemChanges();
})(jQuery);
