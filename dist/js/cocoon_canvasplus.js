/*jshint loopfunc: true */

/**
* @fileOverview
* <h3>Canvas+ internal Webview </h3>
* <p>Canvas+ allows accessing a full DOM environment via Webview. Thus, there are two environments that live together: Canvas+ and WebView. Although both are two different JavaScript environments, Cocoon allows to render a transparent Webview on top of the Canvas+ OpenGL ES rendering context and it also provides a bidirectional communication channel between them. In this way, the final visual result seems to integrate both environments seamlessly.</p>
* <p>However, as Cordova only injects automatically the required clobbers in the main webview engine, it is neccesary to add manually the following files to the content that will be sent and displayed in Canvas+ internal Webview: </p>
<ul>
   <li><a href="https://github.com/ludei/cocoon-common/blob/master/src/js/cocoon.js" target="_blank">cocoon.js</a></li>
   <li><a href="https://github.com/CocoonIO/cocoon-canvasplus/blob/master/dist/js/cocoon_canvasplus.js" target="_blank">cocoon_canvasplus.js</a></li>
</ul>
<br/>
<h3>Documentation</h3>
<p> Select the specific namespace below to open the relevant documentation section:</p>
<ul>
   <li><a href="http://ludei.github.io/cocoon-common/dist/doc/js/Cocoon.html">Cocoon</a></li>
   <li><a href="Cocoon.App.html">App</a></li>
   <li><a href="Cocoon.Device.html">Device</a></li>
   <li><a href="Cocoon.Dialog.html">Dialog</a></li>
   <li><a href="Cocoon.Motion.html">Motion</a></li>
   <li><a href="Cocoon.Proxify.html">Proxify</a></li>
   <li><a href="Cocoon.Touch.html">Touch</a></li>
   <li><a href="Cocoon.Utils.html">Utils</a></li>
   <li><a href="Cocoon.WebView.html">WebView</a></li>
   <li><a href="Cocoon.Widget.html">Widget</a></li>
</ul>
* We hope you find everything you need to get going here, but if you stumble on any problems with the docs or the plugins, 
* just drop us a line at our forums and we'll do our best to help you out.
<h3>Tools</h3>
<a href="https://forums.cocoon.io/"><img src="img/cocoon-tools-1.png" /></a>
<a href="https://cocoon.io/doc"><img src="img/cocoon-tools-2.png" /></a>
<a href="http://cocoon.io/"><img src="img/cocoon-tools-3.png" /></a>
* @version 1.0
*/

/**
* @fileOverview
* <h1>Canvas+ API documentation</h1>
* <p>Cocoon Canvas+ are multiplatform Javascript utilities that work in Canvas+. These plugins are included in Canvas+ core, so it is not required to install anything else at the cloud. The required files, if so, will be injected automatically in your project.</p> 
* <h3>Important note</h3>
* <p>Unlike old CocoonJS plugins, Cocoon Canvas+ plugins need to wait for Cordova <a href="https://cordova.apache.org/docs/en/4.0.0/cordova_events_events.md.html#deviceready">"deviceready" event</a> to start working.</p>
* @example
*   document.addEventListener("deviceready", onDeviceReady, false);
*   function onDeviceReady() {
*       // Cocoon Canvas+ code here
*   }  
*/

(function () {

    /**
    * The "Cocoon" object holds all the Cocoon Canvas+ Extensions and other stuff needed.
    <p> For more information about this specific namespace, please, visit the following link: </p>
    <li><a href="http://ludei.github.io/cocoon-common/dist/doc/js/Cocoon.html">Cocoon common documentation</a></li>
    * @namespace Cocoon
    */
    var Cocoon = window.Cocoon;
    if (!Cocoon && window.cordova && typeof require !== 'undefined') {
        require('cocoon-plugin-common.Cocoon');
    }

    /**
     * Is the native environment available? true if so.
     * @property {bool} version
     * @memberof Cocoon
     * @private
     * @example
     * if(Cocoon.nativeAvailable) { ... do native stuff here ... }
     */

    Cocoon.nativeAvailable = function () {
        return (!!window.ext);
    };

    /**
    * This utility function copies the properties from one object to a new object array, the result object array can be used as arguments when calling Cocoon.callNative()
    * @memberof Cocoon
    * @static
    * @private
    * @param {function} obj The base object that contains all properties defined.
    * @param {function} copy The object that user has defined.
    */
    Cocoon.clone = function (obj, copy) {
        if (null === obj || "object" !== typeof obj) return obj;
        var arr = [];
        for (var attr in obj) {
            if (copy.hasOwnProperty(attr)) {
                arr.push(copy[attr]);
            } else {
                arr.push(obj[attr]);
            }
        }
        return arr;
    };

    /**
    * IMPORTANT: This function should only be used by Ludei.
    * This function allows a call to the native extension object function reusing the same arguments object.
    * Why is interesting to use this function instead of calling the native object's function directly?
    * As the Cocoon object functions expicitly receive parameters, if they are not present and the native call is direcly mapped,
    * undefined arguments are passed to the native side. Some native functions do not check the parameters validation
    * correctly (just check the number of parameters passed).
    * Another solution instead of using this function call is to correctly check if the parameters are valid (not undefined) to make the
    * call, but it takes more work than using this approach.
    * @static
    * @private
    * @param {string} nativeExtensionObjectName The name of the native extension object name. The object that is a member of the 'ext' object.
    * @param {string} nativeFunctionName The name of the function to be called inside the native extension object.
    * @param {object} arguments The arguments object of the Cocoon extension object function. It contains all the arguments passed to the Cocoon extension object function and these are the ones that will be passed to the native call too.
    * @param {boolean} [async] A flag to indicate if the makeCall (false or undefined) or the makeCallAsync function should be used to perform the native call.
    * @returns Whatever the native function call returns.
    */
    Cocoon.callNative = function (nativeExtensionObjectName, nativeFunctionName, args, async) {
        if (Cocoon.nativeAvailable()) {
            var argumentsArray = Array.prototype.slice.call(args);
            argumentsArray.unshift(nativeFunctionName);
            var nativeExtensionObject = ext[nativeExtensionObjectName];
            var makeCallFunction = async ? nativeExtensionObject.makeCallAsync : nativeExtensionObject.makeCall;
            var ret = makeCallFunction.apply(nativeExtensionObject, argumentsArray);
            var finalRet = ret;
            if (typeof ret === "string") {
                try {
                    finalRet = JSON.parse(ret);
                }
                catch (error) {
                    console.log(error);
                }
            }
            return finalRet;
        }
    };

    /**
    * Returns an object retrieved from a path specified by a dot specified text path starting from a given base object.
    * It could be useful to find the reference of an object from a defined base object. For example the base object could be window and the
    * path could be "Cocoon.App" or "document.body".
    * @static
    * @param {Object} baseObject The object to start from to find the object using the given text path.
    * @param {string} objectPath The path in the form of a text using the dot notation. i.e. "document.body"
    * @private
    * @memberof Cocoon
    * For example:
    * var body = Cocoon.getObjectFromPath(window, "document.body");
    */
    Cocoon.getObjectFromPath = function (baseObject, objectPath) {
        var parts = objectPath.split('.');
        var obj = baseObject;
        for (var i = 0, len = parts.length; i < len; ++i) {
            obj[parts[i]] = obj[parts[i]] || undefined;
            obj = obj[parts[i]];
        }
        return obj;
    };

    /**
    * A class that represents objects to handle events. Event handlers have always the same structure:
    * Mainly they provide the addEventListener and removeEventListener functions.
    * Both functions receive a callback function that will be added or removed. All the added callback
    * functions will be called when the event takes place.
    * Additionally they also allow the addEventListenerOnce and notifyEventListeners functions.
    * @constructor
    * @param {string} nativeExtensionObjectName The name of the native extension object (inside the ext object) to be used.
    * @param {string} CocoonExtensionObjectName The name of the sugarized extension object.
    * @param {string} nativeEventName The name of the native event inside the ext object.
    * @param {number} [chainFunction] An optional function used to preprocess the listener callbacks. This function, if provided,
    * will be called before any of the other listeners.
    * @memberof Cocoon
    * @private
    * @static
    */
    Cocoon.EventHandler = function (nativeExtensionObjectName, CocoonExtensionObjectName, nativeEventName, chainFunction) {
        this.listeners = [];
        this.listenersOnce = [];
        this.chainFunction = chainFunction;

        /**
        * Adds a callback function so it can be called when the event takes place.
        * @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */
        this.addEventListener = function (listener) {
            if (chainFunction) {
                var f = function () {
                    chainFunction.call(this, arguments.callee.sourceListener, Array.prototype.slice.call(arguments));
                };
                listener.CocoonEventHandlerChainFunction = f;
                f.sourceListener = listener;
                listener = f;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listeners.push(listener);
                }
            }
        };
        /**
        * Adds a callback function that will be called only one time.
        * @param {function} listener The callback function to be added to the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */

        this.addEventListenerOnce = function (listener) {
            if (chainFunction) {
                var f = function () { chainFunction(arguments.callee.sourceListener, Array.prototype.slice.call(arguments)); };
                f.sourceListener = listener;
                listener = f;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].addEventListenerOnce(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener < 0) {
                    this.listenersOnce.push(listener);
                }
            }
        };

        /**
        * Removes a callback function that was added to the event handler so it won't be called when the event takes place.
        * @param {function} listener The callback function to be removed from the event handler object. See the referenced Listener function documentation for more detail in each event handler object's documentation.
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */
        this.removeEventListener = function (listener) {

            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListener(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listeners.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listeners.splice(indexOfListener, 1);
                }
            }
        };

        this.removeEventListenerOnce = function (listener) {

            if (chainFunction) {
                listener = listener.CocoonEventHandlerChainFunction;
                delete listener.CocoonEventHandlerChainFunction;
            }

            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].removeEventListenerOnce(nativeEventName, listener);
            }
            else {
                var indexOfListener = this.listenersOnce.indexOf(listener);
                if (indexOfListener >= 0) {
                    this.listenersOnce.splice(indexOfListener, 1);
                }
            }
        };

        /**
        * @memberof Cocoon.EventHandler
        * @private
        * @static
        */

        this.notifyEventListeners = function () {
            var CocoonExtensionObject = Cocoon.getObjectFromPath(Cocoon, CocoonExtensionObjectName);
            if (CocoonExtensionObject && CocoonExtensionObject.nativeAvailable) {
                ext[nativeExtensionObjectName].notifyEventListeners(nativeEventName);
            } else {

                var argumentsArray = Array.prototype.slice.call(arguments);
                var listeners = Array.prototype.slice.call(this.listeners);
                var listenersOnce = Array.prototype.slice.call(this.listenersOnce);
                var _this = this;
                // Notify listeners after a while ;) === do not block this thread.
                setTimeout(function () {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(_this, argumentsArray);
                    }
                    for (i = 0; i < listenersOnce.length; i++) {
                        listenersOnce[i].apply(_this, argumentsArray);
                    }
                }, 0);

                _this.listenersOnce = [];
            }
        };
        return this;
    };

    /**
    * This namespace is used to create an Event Emitter/Dispatcher that works together.
    * with the Cocoon.EventHandler.
    * @namespace Cocoon.Signal
    * @private
    */

    /**
    * This constructor creates a new Signal that holds and emits different events that are specified inside each extension.
    * @memberof Cocoon.Signal
    * @private
    * @constructs createSignal
    */
    Cocoon.createSignal = function () {
        /** @lends Cocoon.Signal.prototype */
        this.handle = null;
        this.signals = {};

        /**
        * Registers a new Signal.
        * @param {string} namespace The name of the signal which will be emitted.
        * @param {object} handle The Cocoon.EventHandler that will handle the signals.
        * @function register
        * @private
        * @example
        * signal.register("banner.ready", new Cocoon.EventHandler);
        */
        this.register = function (namespace, handle) {

            if ((!namespace) && (!handle)) throw new Error("Can't create signal " + (namespace || ""));

            if (handle.addEventListener) {
                this.signals[namespace] = handle;
                return true;
            }

            if (!handle.addEventListener) {
                this.signals[namespace] = {};
                for (var prop in handle) {
                    if (handle.hasOwnProperty(prop)) {
                        this.signals[namespace][prop] = handle[prop];
                    }
                }
                return true;
            }

            throw new Error("Can't create handler for " + namespace + " signal.");
        };

        /**
        * Exposes the already defined signals, and can be use to atach a callback to a Cocoon.EventHandler event.
        * @param {string} signal The name of the signal which will be emitted.
        * @param {object} callback The Cocoon.EventHandler that will handle the signals.
        * @param {object} params Optional parameters, example { once : true }
        * @function expose
        * @private
        * @example
        * Cocoon.namespace.on("event",function(){});
        */
        this.expose = function () {
            return function (signal, callback, params) {
                var once = false;

                if (arguments.length === 1) {
                    var that = this;
                    var fnc = function (signal) {
                        this.signal = signal;
                    };

                    fnc.prototype.remove = function (functionListener) {
                        var handle = that.signals[this.signal];
                        if (handle && handle.removeEventListener) {
                            handle.removeEventListener.apply(that, [functionListener]);
                            that.signals[this.signal] = undefined;
                        }
                    };
                    return new fnc(signal);
                }

                if ((params) && (params.once)) {
                    once = true;
                }

                if (!this.signals[signal]) throw new Error("The signal " + signal + " does not exists.");
                var handle = this.signals[signal];
                if (handle.addEventListener) {
                    if (once) {
                        handle.addEventListenerOnce(function () {
                            callback.apply(this || window, arguments);
                        });
                    } else {
                        handle.addEventListener(function () {
                            callback.apply(this || window, arguments);
                        });
                    }
                }

                if (!this.signals[signal].addEventListener) {
                    for (var prop in this.signals[signal]) {

                        if (!this.signals[signal].hasOwnProperty(prop)) continue;

                        handle = this.signals[signal][prop];

                        if (once) {
                            handle.addEventListenerOnce(function () {
                                this.clbk[this.name].apply(this || window, arguments);
                            }.bind({ name: prop, clbk: callback }));
                        } else {
                            handle.addEventListener(function () {
                                this.clbk[this.name].apply(this || window, arguments);
                            }.bind({ name: prop, clbk: callback }));
                        }

                    }
                }

            }.bind(this);
        };
    };

    //properties for old legacy code compatibility
    window.CocoonJS = window.Cocoon;
    window.c2cocoonjs = true;

})();
/**
 * This namespace represents different methods to control your application.
 * @namespace Cocoon.App
 * @example
 * // Example 1: Closes the application
 * Cocoon.App.exit();
 * // Example 2: Opens a given URL
 * Cocoon.App.openURL("http://www.ludei.com");
 * // Example 3: Fired when the application is suspended
 * Cocoon.App.on("suspended", function(){
 *  ...
 * });
 */
Cocoon.define("Cocoon.App", function (extension) {

    extension.nativeAvailable = function () {
        return (!!window.ext) && (!!window.ext.IDTK_APP);
    };

    extension.isBridgeAvailable = function () {
        if (Cocoon.App.forward.nativeAvailable === 'boolean') {
            return Cocoon.App.forward.nativeAvailable;
        }
        else {
            var available = Cocoon.callNative("IDTK_APP", "forwardAvailable", arguments);
            available = !!available;
            Cocoon.App.forward.nativeAvailable = available;
            return available;
        }
    };


    var cocoonWebviewIFrame = 'CocoonJS_App_ForCocoonJS_WebViewIFrame';
    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from Canvas+ the WebView and viceversa).
     * It waits until the code is executed and the result of it is returned === synchronous.
     * @function forward
     * @memberof Cocoon.App
     * @param {string} code Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from Canvas+ to the WebView and viceversa).
     * @return {string} The result of the execution of the passed JavaScript code in the different JavaScript environment.
     * @example
     * Cocoon.App.forward("alert('Ludei!');");
     */
    extension.forward = function (javaScriptCode) {
        /*jshint evil:true */
        if (Cocoon.App.nativeAvailable() && Cocoon.App.isBridgeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "forward", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name === cocoonWebviewIFrame) {
                return window.parent.eval(javaScriptCode);
            }
            else {
                return window.frames[cocoonWebviewIFrame].window.eval(javaScriptCode);
            }
        }
    };

    /**
     * Makes a forward call of some javascript code to be executed in a different environment (i.e. from Canvas+ to the WebView and viceversa).
     * It is asyncrhonous so it does not wait until the code is executed and the result of it is returned. Instead, it calls a callback function when the execution has finished to pass the result.
     * @function forwardAsync
     * @memberof Cocoon.App
     * @param {string} javaScriptCode Some JavaScript code in a string to be forwarded and executed in a different JavaScript environment (i.e. from Canvas+ to the WebView and viceversa).
     * @param {function} [callback] A function callback (optional) that will be called when the passed JavaScript code is executed in a different thread to pass the result of the execution in the different JavaScript environment.
     * @example
     * Cocoon.App.forwardAsync("alert('Ludei!');", function(){
     * ...
     * });
     */
    extension.forwardAsync = function (javaScriptCode, returnCallback) {
        if (Cocoon.App.nativeAvailable() && Cocoon.App.isBridgeAvailable()) {
            if (typeof returnCallback !== 'undefined') {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode, returnCallback);
            }
            else {
                return ext.IDTK_APP.makeCallAsync("forward", javaScriptCode);
            }
        }
        else {
            setTimeout(function () {
                /*jshint evil:true */
                var res;
                if (window.name === cocoonWebviewIFrame) {
                    res = window.parent.eval(javaScriptCode);
                }
                else {
                    res = window.parent.frames[cocoonWebviewIFrame].window.eval(javaScriptCode);
                }

                if (returnCallback) {
                    returnCallback(res);
                }

            }, 1);
        }
    };

    /**
     * Allows to load a new JavaScript/HTML5 resource that can be loaded either locally (inside the platform/device storage) or using a remote URL.
     * @function load
     * @memberof Cocoon.App
     * @param {string} path A path to a resource stored in the platform or in a URL to a remote resource.
     * @param {Cocoon.App.StorageType} [storageType] If the path argument represents a locally stored resource, the developer can specify the storage where it is stored. If no value is passes, the {@link Cocoon.App.StorageType.APP_STORAGE} value is used by default.
     * @example
     * Cocoon.App.load("index.html");
     */
    extension.load = function (path, storageType) {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "loadPath", arguments);
        }
        else if (!navigator.isCocoonJS) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    var jsCode;
                    if (xhr.status === 200) {
                        // If there is no webview, it means we are in the webview, so notify Canvas+
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInTheWebViewSucceed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in CocoonJS, so notify the webview environment
                        else {
                            jsCode = "window.Cocoon && window.Cocoon.App.onLoadInCocoonJSSucceed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                        window.location.href = path;
                    }
                    else if (xhr.status === 404) {
                        this.onreadystatechange = null;
                        // If there is no webview, it means we are in the webview, so notify Canvas+
                        if (!Cocoon.App.EmulatedWebViewIFrame) {
                            jsCode = "Cocoon && Cocoon.App.onLoadInTheWebViewFailed.notifyEventListeners('" + path + "');";
                        }
                        // If there is a webview, it means we are in Canvas+, so notify the webview
                        else {
                            jsCode = "Cocoon && Cocoon.App.onLoadInCocoonJSFailed.notifyEventListeners('" + path + "');";
                        }
                        Cocoon.App.forwardAsync(jsCode);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
     * Reloads the last loaded path in the current context.
     * @function reload
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.reload();
     */
    extension.reload = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "reload", arguments);
        }
        else if (!navigator.isCocoonJS) {
            if (window.name === cocoonWebviewIFrame) {
                return window.parent.location.reload();
            }
            else {
                return window.parent.frames[cocoonWebviewIFrame].window.location.reload();
            }
        }
    };

    /**
     * Opens a given URL using a system service that is able to open it. For example, open a HTTP URL using the system WebBrowser.
     * @function openURL
     * @memberof Cocoon.App
     * @param {string} url The URL to be opened by a system service.
     * @example
     * Cocoon.App.openURL("http://www.ludei.com");
     */
    extension.openURL = function (url) {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "openURL", arguments, true);
        }
        else if (!navigator.isCocoonJS) {
            window.open(url, '_blank');
        }
    };

    /**
     * Forces the app to finish.
     * @function exit
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.exit();
     */
    extension.exit = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "forceToFinish", arguments);
        }
        else if (!navigator.isCocoonJS) {
            window.close();
        }
    };

    /**
     * 
     * @memberof Cocoon.App
     * @name Cocoon.App.StorageType
     * @property {string} Cocoon.App.StorageType - The base object
     * @property {string} Cocoon.App.StorageType.APP_STORAGE The application storage
     * @property {string} Cocoon.App.StorageType.INTERNAL_STORAGE Internal Storage
     * @property {string} Cocoon.App.StorageType.EXTERNAL_STORAGE External Storage
     * @property {string} Cocoon.App.StorageType.TEMPORARY_STORAGE Temporary Storage
     */
    extension.StorageType = {
        APP_STORAGE: "APP_STORAGE",
        INTERNAL_STORAGE: "INTERNAL_STORAGE",
        EXTERNAL_STORAGE: "EXTERNAL_STORAGE",
        TEMPORARY_STORAGE: "TEMPORARY_STORAGE"
    };

    extension.onSuspended = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspended");

    extension.onActivated = new Cocoon.EventHandler("IDTK_APP", "App", "onactivated");

    extension.onSuspending = new Cocoon.EventHandler("IDTK_APP", "App", "onsuspending");

    extension.onMemoryWarning = new Cocoon.EventHandler("IDTK_APP", "App", "onmemorywarning");

    var signal = new Cocoon.createSignal();

    /**
     * Allows to listen to events called when the application is suspended.
     * The callback function does not receive any parameter.
     * @event On application suspended
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("suspended", function(){
     *  ...
     * });
     */
    signal.register("suspended", extension.onSuspended);
    /**
     * Allows to listen to events called when the application is activated.
     * The callback function does not receive any parameter.
     * @event On application activated
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("activated", function(){
     *  ...
     * });
     */
    signal.register("activated", extension.onActivated);

    /**
     * Allows to listen to events called when the application is suspending.
     * The callback function does not receive any parameter.
     * @event On application suspending
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("suspending", function(){
     *  ...
     * });
     */
    signal.register("suspending", extension.onSuspending);

    /**
     * Allows to listen to memory warning notifications from the system
     * It is strongly recommended that you implement this method and free up as much memory as possible by disposing of cached data objects, images on canvases that can be recreated.
     * @event On memory warning
     * @memberof Cocoon.App
     * @example
     * Cocoon.App.on("memorywarning", function(){
     *  ...
     * });
     */
    signal.register("memorywarning", extension.onMemoryWarning);


    extension.on = signal.expose();

    return extension;
});
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */

if (window.Box2D && window.Box2D.HEAP32) {
    console.log("The CocoonJS binding for Box2D has been ignored because Box2D Emscripten have been found");
}
else if (window.Box2D) {
    console.log("The CocoonJS binding for Box2D has been ignored another Box2D have been found");
}
else if ( !window.ext || typeof window.ext.IDTK_SRV_BOX2D === 'undefined' ){
    console.log("The CocoonJS binding for Box2D has been ignored because ext.IDTK_SRV_BOX2D is not available");   
}
else{
    // Load our binding
    window.Box2D                  = {};
    window.CocoonBox2D =   window.Box2D; //Duplicate object to avoid window.Box2D override in some engines
    window.Box2D.Dynamics         = {};
    window.Box2D.Dynamics.Joints  = {};
    window.Box2D.Common           = {};
    window.Box2D.Common.Math      = {};
    window.Box2D.Collision        = {};
    window.Box2D.Collision.Shapes = {};

    (function (){
        "use strict";

        function b2Err(msg) {
            console.error( msg );
        }

        // ***************************************************************************
        //                                 b2Vec2
        // ***************************************************************************

        var B2Vec2 = function (x_, y_) {
            if (x_ === undefined){x_ = 0;}
            if (y_ === undefined){y_ = 0;}
            this.x = x_;
            this.y = y_;
        };
   
        window.Box2D.Common.Math.b2Vec2 = B2Vec2;

        B2Vec2.prototype.SetZero = function () {
            this.x = 0.0;
            this.y = 0.0;
        };

        B2Vec2.prototype.Set = function (x_, y_) {
            if (x_ === undefined){x_ = 0;}
            if (y_ === undefined){y_ = 0;}
            this.x = x_;
            this.y = y_;
        };
   
        B2Vec2.prototype.SetV = function (v) {
            if( v === undefined ){
                b2Err("undefined 'v' in b2Vec2.SetV");
            }
            this.x = v.x;
            this.y = v.y;
        };

        B2Vec2.Make = function (x_, y_) {
            if (x_ === undefined){x_ = 0;}
            if (y_ === undefined){y_ = 0;}
            return new B2Vec2(x_, y_);
        };

        // Functions to mimic Construct2's b2vec2 cache interface so this extension
        // can be included in Construct2 games without modification
        if( B2Vec2.Get === undefined ) {
            B2Vec2.Get = B2Vec2.Make;
            B2Vec2._freeCache = [];
        
            B2Vec2.Free = function() {};
        }

        B2Vec2.prototype.Copy = function () {
            return new B2Vec2(this.x, this.y);
        };

        B2Vec2.prototype.Add = function (v) {
            if( v === undefined ){
                b2Err("undefined 'v' in b2Vec2.Add");
            }
            this.x += v.x;
            this.y += v.y;
        };

        B2Vec2.prototype.Subtract = function (v) {
            if( v === undefined ){
                b2Err("undefined 'v' in b2Vec2.Subtract");
            }

            this.x -= v.x;
            this.y -= v.y;
        };

        B2Vec2.prototype.Multiply = function (a) {
            if (a === undefined){
                a = 0;
            }
            this.x *= a;
            this.y *= a;
        };

        B2Vec2.prototype.Length = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };

        B2Vec2.prototype.LengthSquared = function () {
            return (this.x * this.x + this.y * this.y);
        };

        B2Vec2.prototype.Normalize = function () {
            var length = Math.sqrt(this.x * this.x + this.y * this.y);
            if (length < Number.MIN_VALUE) {
                return 0.0;
            }
            var invLength = 1.0 / length;
            this.x *= invLength;
            this.y *= invLength;
            return length;
        };

        B2Vec2.prototype.NegativeSelf = function () {
            this.x = (-this.x);
            this.y = (-this.y);
        };

        // ***************************************************************************
        //                                 b2Mat22
        // ***************************************************************************

        var B2Mat22 = function () {
            this.col1 = new B2Vec2();
            this.col2 = new B2Vec2();
            this.SetIdentity();
        };

        window.Box2D.Common.Math.b2Mat22 = B2Mat22 ;

        B2Mat22.FromAngle = function (angle) {
            if (angle === undefined){
                angle = 0;
            }
            var mat = new B2Mat22();
            mat.Set(angle);
            return mat;
        };

        B2Mat22.FromVV = function (c1, c2) {
            var mat = new B2Mat22();
            mat.SetVV(c1, c2);
            return mat;
        };
       
        B2Mat22.prototype.Set = function (angle) {
            if (angle === undefined){
                angle = 0;
            }
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            this.col1.x = c;
            this.col2.x = (-s);
            this.col1.y = s;
            this.col2.y = c;
        };

        B2Mat22.prototype.SetVV = function (c1, c2) {
            this.col1.SetV(c1);
            this.col2.SetV(c2);
        };
       
        B2Mat22.prototype.Copy = function () {
            var mat = new B2Mat22();
            mat.SetM(this);
            return mat;
        };
       
        B2Mat22.prototype.SetM = function (m) {
            this.col1.SetV(m.col1);
            this.col2.SetV(m.col2);
        };
       
        B2Mat22.prototype.AddM = function (m) {
            this.col1.x += m.col1.x;
            this.col1.y += m.col1.y;
            this.col2.x += m.col2.x;
            this.col2.y += m.col2.y;
        };
       
        B2Mat22.prototype.SetIdentity = function () {
            this.col1.x = 1.0;
            this.col2.x = 0.0;
            this.col1.y = 0.0;
            this.col2.y = 1.0;
        };
       
        B2Mat22.prototype.SetZero = function () {
            this.col1.x = 0.0;
            this.col2.x = 0.0;
            this.col1.y = 0.0;
            this.col2.y = 0.0;
        };
       
        B2Mat22.prototype.GetAngle = function () {
            return Math.atan2(this.col1.y, this.col1.x);
        };
       
        B2Mat22.prototype.GetInverse = function (out) {
            var a = this.col1.x;
            var b = this.col2.x;
            var c = this.col1.y;
            var d = this.col2.y;
            var det = a * d - b * c;
            if (det !== 0.0) {
                det = 1.0 / det;
            }
            out.col1.x = det * d;
            out.col2.x = (-det * b);
            out.col1.y = (-det * c);
            out.col2.y = det * a;
            return out;
        };
        
        B2Mat22.prototype.Solve = function (out, bX, bY) {
            if (bX === undefined){bX = 0;}
            if (bY === undefined){bY = 0;}
            var a11 = this.col1.x;
            var a12 = this.col2.x;
            var a21 = this.col1.y;
            var a22 = this.col2.y;
            var det = a11 * a22 - a12 * a21;
            if (det !== 0.0) {
                det = 1.0 / det;
            }
            out.x = det * (a22 * bX - a12 * bY);
            out.y = det * (a11 * bY - a21 * bX);
            return out;
        };

        B2Mat22.prototype.Abs = function () {
            this.col1.Abs();
            this.col2.Abs();
        };
    
        // ***************************************************************************
        //                               b2Transform
        // ***************************************************************************
    
        var B2Transform = function (pos, r) {
            this.position = new B2Vec2();
            this.R = new B2Mat22();
    
            if (pos === undefined){pos = null;}
            if (r === undefined){r = null;}
            if (pos) {
                this.position.SetV(pos);
                this.R.SetM(r);
            }
        };
    
        window.Box2D.Common.Math.b2Transform = B2Transform ;
    
        B2Transform.prototype.Initialize = function (pos, r) {
            this.position.SetV(pos);
            this.R.SetM(r);
        };
       
        B2Transform.prototype.SetIdentity = function () {
            this.position.SetZero();
            this.R.SetIdentity();
        };
       
        B2Transform.prototype.Set = function (x) {
            this.position.SetV(x.position);
            this.R.SetM(x.R);
        };

        B2Transform.prototype.SetAngle = function () {
            return Math.atan2(this.R.col1.y, this.R.col1.x);
        };
    
    
        // ***************************************************************************
        //                               b2Math
        // ***************************************************************************
       
        var b2Math = function () {};

        window.Box2D.Common.Math.b2Math = b2Math ;
    
        b2Math.IsValid = function (x) {
            if (x === undefined){
                x = 0;
            }
            return isFinite(x);
        };

        b2Math.Dot = function (a, b) {
            return a.x * b.x + a.y * b.y;
        };

        b2Math.CrossVV = function (a, b) {
            return a.x * b.y - a.y * b.x;
        };

        b2Math.CrossVF = function (a, s) {
            if (s === undefined){
                s = 0;
            }
            var v = new B2Vec2(s * a.y, (-s * a.x));
            return v;
        };

        b2Math.CrossFV = function (s, a) {
            if (s === undefined){
                s = 0;
            }
            var v = new B2Vec2((-s * a.y), s * a.x);
            return v;
        };

        b2Math.MulMV = function (A, v) {
            if( v === undefined ){
                b2Err("undefined 'v' in b2Math.MulMV");
            }
    
            var u = new B2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
            return u;
        };

        b2Math.MulTMV = function (A, v) {
            var u = new B2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
            return u;
        };

        b2Math.MulX = function (T, v) {
            var a = b2Math.MulMV(T.R, v);
            a.x += T.position.x;
            a.y += T.position.y;
            return a;
        };

        b2Math.MulXT = function (T, v) {
            var a = b2Math.SubtractVV(v, T.position);
            var tX = (a.x * T.R.col1.x + a.y * T.R.col1.y);
            a.y = (a.x * T.R.col2.x + a.y * T.R.col2.y);
            a.x = tX;
            return a;
        };

        b2Math.AddVV = function (a, b) {
            var v = new B2Vec2(a.x + b.x, a.y + b.y);
            return v;
        };

        b2Math.SubtractVV = function (a, b) {
            var v = new B2Vec2(a.x - b.x, a.y - b.y);
            return v;
        };

        b2Math.Distance = function (a, b) {
            var cX = a.x - b.x;
            var cY = a.y - b.y;
            return Math.sqrt(cX * cX + cY * cY);
        };

        b2Math.DistanceSquared = function (a, b) {
            var cX = a.x - b.x;
            var cY = a.y - b.y;
            return (cX * cX + cY * cY);
        };

        b2Math.MulFV = function (s, a) {
            if (s === undefined){
                s = 0;
            }
            var v = new B2Vec2(s * a.x, s * a.y);
            return v;
        };

        b2Math.AddMM = function (A, B) {
            var C = B2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
            return C;
        };

        b2Math.MulMM = function (A, B) {
            var C = B2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
            return C;
        };

        b2Math.MulTMM = function (A, B) {
            var c1 = new B2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
            var c2 = new B2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
            var C = B2Mat22.FromVV(c1, c2);
            return C;
        };

        b2Math.Abs = function (a) {
            if (a === undefined){
                a = 0;
            }
            return a > 0.0 ? a : (-a);
        };
       
        b2Math.AbsV = function (a) {
            var b = new B2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
            return b;
        };
        
        b2Math.AbsM = function (A) {
            var B = B2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
            return B;
        };
       
        b2Math.Min = function (a, b) {
            if (a === undefined){a = 0;}
            if (b === undefined){b = 0;}
            return a < b ? a : b;
        };

        b2Math.MinV = function (a, b) {
            var c = new B2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
            return c;
        };
       
        b2Math.Max = function (a, b) {
            if (a === undefined){a = 0;}
            if (b === undefined){b = 0;}
            return a > b ? a : b;
        };

        b2Math.MaxV = function (a, b) {
            var c = new B2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
            return c;
        };
       
        b2Math.Clamp = function (a, low, high) {
            if (a === undefined){a = 0;}
            if (low === undefined){low = 0;}
            if (high === undefined){high = 0;}
            return a < low ? low : a > high ? high : a;
        };

        b2Math.ClampV = function (a, low, high) {
            return b2Math.MaxV(low, b2Math.MinV(a, high));
        };

        b2Math.Swap = function (a, b) {
            var tmp = a[0];
            a[0] = b[0];
            b[0] = tmp;
        };

        b2Math.Random = function () {
            return Math.random() * 2 - 1;
        };

        b2Math.RandomRange = function (lo, hi) {
            if (lo === undefined){lo = 0;}
            if (hi === undefined){hi = 0;}
            var r = Math.random();
            r = (hi - lo) * r + lo;
            return r;
        };

        /* jshint -W016 */
        b2Math.NextPowerOfTwo = function (x) {
            if (x === undefined){x = 0;}
            x |= (x >> 1) & 0x7FFFFFFF;
            x |= (x >> 2) & 0x3FFFFFFF;
            x |= (x >> 4) & 0x0FFFFFFF;
            x |= (x >> 8) & 0x00FFFFFF;
            x |= (x >> 16) & 0x0000FFFF;
            return x + 1;
        };
       
        b2Math.IsPowerOfTwo = function (x) {
            if (x === undefined){x = 0;}
            var result = x > 0 && (x & (x - 1)) === 0;
            return result;
        };
        /* jshint +W016 */
       
        b2Math.b2Vec2_zero = new B2Vec2(0.0, 0.0);
        b2Math.b2Mat22_identity = B2Mat22.FromVV(new B2Vec2(1.0, 0.0), new B2Vec2(0.0, 1.0));
        b2Math.b2Transform_identity = new B2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);
    
        // ***************************************************************************
        //                               b2DebugDraw
        // ***************************************************************************
     
        var B2DebugDraw = function(){
            this.e_aabbBit = 0x0004; 
            this.e_centerOfMassBit = 0x0010;
            this.e_controllerBit = 0x0020;
            this.e_jointBit = 0x0002;
            this.e_pairBit  = 0x0008;
            this.e_shapeBit = 0x000;
        };
    
        window.Box2D.Dynamics.b2DebugDraw = B2DebugDraw ;
    
        B2DebugDraw.prototype.AppendFlags      = function(){};
        B2DebugDraw.prototype.ClearFlags       = function(){};
        B2DebugDraw.prototype.DrawCircle       = function(){};
        B2DebugDraw.prototype.DrawPolygon      = function(){};
        B2DebugDraw.prototype.DrawSegment      = function(){};
        B2DebugDraw.prototype.DrawSolidCircle  = function(){};
        B2DebugDraw.prototype.DrawSolidPolygon = function(){};
        B2DebugDraw.prototype.DrawTransform    = function(){};
        B2DebugDraw.prototype.GetAlpha         = function(){};
        B2DebugDraw.prototype.GetDrawScale     = function(){};
        B2DebugDraw.prototype.GetFillAlpha     = function(){};
        B2DebugDraw.prototype.GetFlags         = function(){};
        B2DebugDraw.prototype.GetLineThickness = function(){};
        B2DebugDraw.prototype.GetSprite        = function(){};
        B2DebugDraw.prototype.GetXFormScale    = function(){};
        B2DebugDraw.prototype.SetAlpha         = function(){};
        B2DebugDraw.prototype.SetDrawScale     = function(){};
        B2DebugDraw.prototype.SetFillAlpha     = function(){};
        B2DebugDraw.prototype.SetFlags         = function(){};
        B2DebugDraw.prototype.SetLineThickness = function(){};
        B2DebugDraw.prototype.SetSprite        = function(){};
        B2DebugDraw.prototype.SetXFormScale    = function(){};
    
    
        // ***************************************************************************
        //                               b2BodyDef
        // ***************************************************************************
       
        var B2BodyDef  = function () {
            this.position = new B2Vec2(0,0);
            this.linearVelocity = new B2Vec2();
            this.userData = null;
            this.angle = 0.0;
            this.linearVelocity.Set(0, 0);
            this.angularVelocity = 0.0;
            this.linearDamping = 0.0;
            this.angularDamping = 0.0;
            this.allowSleep = true;
            this.awake = true;
            this.fixedRotation = false;
            this.bullet = false;
            this.type = B2Body.b2_staticBody;
            this.active = true;
            this.inertiaScale = 1.0;
        };
    
        window.Box2D.Dynamics.b2BodyDef = B2BodyDef;
    
        // ***************************************************************************
        //                                b2Fixture
        // ***************************************************************************
    
        var B2Fixture = function(body,userData, fixtureID, def ) {
            this.m_body = body ;
            this.m_userData = userData ;
            this.m_fixtureID = fixtureID ;
            this.m_shape = {} ;
            this.m_shape.m_centroid = new B2Vec2() ;
            this.m_isSensor = false ;
            this.m_density  = def.density ;
            this.m_friction = def.friction ;
            this.m_restitution = def.restitution ;
            this.m_isSensor = def.isSensor ;
        };
    
        window.Box2D.Dynamics.b2Fixture = B2Fixture ;
    
    
        B2Fixture.prototype.GetBody = function(){ return this.m_body ; } ;
    
        B2Fixture.prototype.GetShape = function() { 
            console.log( "fixture.GetShape not yet supported in CocoonJS Box2D binding" ) ;
            return null ; 
        } ;
    
        B2Fixture.prototype.GetUserData = function() { return this.m_userData ; } ;
    
        B2Fixture.prototype.SetSensor = function(isSensor) { 
            this.m_isSensor = isSensor;
            window.ext.IDTK_SRV_BOX2D.makeCall( "setSensor" , this.m_body.m_world.m_worldID , this.m_fixtureID , this.m_isSensor) ;
        };
    
        B2Fixture.prototype.IsSensor = function() { return this.m_isSensor ; } ;
    
        B2Fixture.prototype.SetDensity     = function( density     ) { window.ext.IDTK_SRV_BOX2D.makeCall( "setDensity"     , this.m_body.m_world.m_worldID , this.m_fixtureID , density     ) ; this.m_density = density         ; } ;
        B2Fixture.prototype.SetFriction    = function( friction    ) { window.ext.IDTK_SRV_BOX2D.makeCall( "setFriction"    , this.m_body.m_world.m_worldID , this.m_fixtureID , friction    ) ; this.m_friction = friction       ; } ;
        B2Fixture.prototype.SetRestitution = function( restitution ) { window.ext.IDTK_SRV_BOX2D.makeCall( "setRestitution" , this.m_body.m_world.m_worldID , this.m_fixtureID , restitution ) ; this.m_restitution = restitution ; } ;
    
        B2Fixture.prototype.GetDensity     = function() { return this.m_density     ; } ;
        B2Fixture.prototype.GetFriction    = function() { return this.m_friction    ; } ;
        B2Fixture.prototype.GetRestitution = function() { return this.m_restitution ; } ;
        
        // ***************************************************************************
        //                                  b2Body
        // ***************************************************************************
    
        var B2Body = function (bd, world) {
            // Backup userdata and set it to null so Cocoon Doesn't read it
            var userData = bd.userData ;
            bd.userData = null;
        
            this.m_world    = world;
            this.m_xf       = new B2Transform( bd.position , B2Mat22.FromAngle(bd.angle));
            this.m_fixtures = [] ;
            this.m_active   = bd.active ;
    
            if( bd.type === B2Body.b2_staticBody ){
                bd.density = 0;
            }
    
            this.m_bodyID = window.ext.IDTK_SRV_BOX2D.makeCall( "createBody" , world.m_worldID , bd ) ;      
            this.m_userData = userData;

            // Restore userdata
            bd.userData = userData ;
        };
    
        window.Box2D.Dynamics.b2Body = B2Body ;
    
        B2Body.prototype.CreateFixture = function (def) {
            var userData = def.userData;
            def.userData = null ;
    
            var fixtureID = window.ext.IDTK_SRV_BOX2D.makeCall( "createFixture" , this.m_world.m_worldID , this.m_bodyID , def ) ; 
            def.userData = userData;
    
            var fixture = new B2Fixture( this , userData , fixtureID , def ) ;
            this.m_world.m_fixturesList[fixtureID] = fixture ;
            this.m_fixtures.push( fixture ) ;
            return fixture;
        };
    
        B2Body.prototype.GetFixtureList = function(){
            if( this.m_fixtures.length === 0 ){
                return null ;
            }
    
            return this.m_fixtures[0] ;
        };
    
        B2Body.prototype.DestroyFixture = function( fixture ){
            window.ext.IDTK_SRV_BOX2D.makeCall( "deleteFixture" , this.m_world.m_worldID , fixture.m_fixtureID ) ; 
            delete this.m_world.m_fixturesList[fixture.m_fixtureID] ;
        };
       
        B2Body.prototype.SetPositionAndAngle = function (position, angle) {
            window.ext.IDTK_SRV_BOX2D.makeCall( "setBodyTransform" , this.m_world.m_worldID , this.m_bodyID , position.x , position.y , angle ) ; 
            this.m_xf.R.Set(angle) ;
            this.m_xf.position.SetV(position) ;
        };
    
        B2Body.prototype.GetPosition = function () { return this.m_xf.position ; } ;
        B2Body.prototype.SetPosition = function (position) { this.SetPositionAndAngle(position, this.GetAngle()) ; } ;
       
        B2Body.prototype.GetLinearVelocity  = function(){
            var v = window.ext.IDTK_SRV_BOX2D.makeCall( "getLinearVelocity" , this.m_world.m_worldID , this.m_bodyID ) ; 
            return new B2Vec2(v[0],v[1]);
        };
    
        B2Body.prototype.GetWorldCenter = function(){
            var p = window.ext.IDTK_SRV_BOX2D.makeCall( "getWorldCenter"  , this.m_world.m_worldID , this.m_bodyID ) ; 
            return new B2Vec2(p[0],p[1]);
        };
    
        B2Body.prototype.GetLocalCenter = function(){
            var p = window.ext.IDTK_SRV_BOX2D.makeCall( "getLocalCenter"  , this.m_world.m_worldID , this.m_bodyID ) ; 
            return new B2Vec2(p[0],p[1]);
        };

        B2Body.prototype.GetLocalPoint = function (worldPoint) {
            return b2Math.MulXT(this.m_xf, worldPoint);
        };
     
        B2Body.prototype.ApplyImpulse = function( impulse , point , wake ) { 
            window.ext.IDTK_SRV_BOX2D.makeCall( "applyImpulse" , this.m_world.m_worldID , this.m_bodyID , impulse.x , impulse.y , point.x , point.y , wake ) ; 
        };
        
        B2Body.prototype.GetMass            = function( )               { return window.ext.IDTK_SRV_BOX2D.makeCall( "getMass" , this.m_world.m_worldID , this.m_bodyID ) ; };
        B2Body.prototype.IsAwake            = function( )               { return window.ext.IDTK_SRV_BOX2D.makeCall( "isAwake"            , this.m_world.m_worldID , this.m_bodyID ) ; } ;
        B2Body.prototype.GetAngularVelocity = function( )               { return window.ext.IDTK_SRV_BOX2D.makeCall( "getAngularVelocity" , this.m_world.m_worldID , this.m_bodyID ) ; } ;
        B2Body.prototype.SetFixedRotation   = function( fixed )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setFixedRotation"   , this.m_world.m_worldID , this.m_bodyID , fixed   ) ; } ;
        B2Body.prototype.SetAwake           = function( state )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setAwake"           , this.m_world.m_worldID , this.m_bodyID , state   ) ; } ;
      
        B2Body.prototype.SetLinearVelocity  = function( vel   )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setLinearVelocity"  , this.m_world.m_worldID , this.m_bodyID , vel.x   , vel.y ) ; } ;
        B2Body.prototype.ApplyForceToCenter = function( force , wake )         { window.ext.IDTK_SRV_BOX2D.makeCall( "applyForceToCenter" , this.m_world.m_worldID , this.m_bodyID , force.x , force.y , wake ) ; } ;
        B2Body.prototype.ApplyForce         = function( force , point , wake ) { window.ext.IDTK_SRV_BOX2D.makeCall( "applyForce"         , this.m_world.m_worldID , this.m_bodyID , force.x , force.y , point.x , point.y , wake ) ; } ;
        B2Body.prototype.ApplyTorque        = function( torque, wake )         { window.ext.IDTK_SRV_BOX2D.makeCall( "applyTorque"        , this.m_world.m_worldID , this.m_bodyID , torque , wake ) ; } ;
        B2Body.prototype.SetLinearDamping   = function( damp  )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setLinearDamping"   , this.m_world.m_worldID , this.m_bodyID , damp    ) ; } ;
        B2Body.prototype.SetAngularVelocity = function( angvel)                { window.ext.IDTK_SRV_BOX2D.makeCall( "setAngularVelocity" , this.m_world.m_worldID , this.m_bodyID , angvel  ) ; } ;
        B2Body.prototype.SetType            = function( type  )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setType"            , this.m_world.m_worldID , this.m_bodyID , type    ) ; } ;
        B2Body.prototype.SetActive          = function( state )                { window.ext.IDTK_SRV_BOX2D.makeCall( "setActive"          , this.m_world.m_worldID , this.m_bodyID , state   ) ; this.m_active = state ; } ;
        B2Body.prototype.IsActive           = function( ) { return this.m_active ; } ;
    
        B2Body.prototype.GetAngle = function () { return this.m_xf.R.GetAngle() ; } ;
    
        B2Body.prototype.SetAngle = function (angle) {
            if (angle === undefined){
                angle = 0;
            }
            this.SetPositionAndAngle(this.GetPosition(), angle);
        };
    
        B2Body.prototype.GetContactList = function () {
            var contacts = window.ext.IDTK_SRV_BOX2D.makeCall( "getObjectContacts" , this.m_world.m_worldID , this.m_bodyID ) ; 
            var result = [];
            for(var i = 0 ; i < contacts.length ; i++){
                result.push(this.m_world.m_bodyList[contacts[i]]);
            }
          
            return result;
        };
    
        B2Body.prototype.SetUserData = function (data) { this.m_userData = data ; } ;
        B2Body.prototype.GetUserData = function () { return this.m_userData ; } ;
        B2Body.prototype.GetWorld    = function () { return this.m_world ; } ;
      
        window.Box2D.Dynamics.b2Body.b2_staticBody    = 0;
        window.Box2D.Dynamics.b2Body.b2_kinematicBody = 1;
        window.Box2D.Dynamics.b2Body.b2_dynamicBody   = 2;
    
    
        // ***************************************************************************
        //                                 Contact
        // ***************************************************************************
       
        var B2Contact = function (fixtureA , fixtureB , touching ) {
            this.m_fixtureA = fixtureA ;
            this.m_fixtureB = fixtureB ;
            this.m_touching = touching ;
        };
        
        window.Box2D.Dynamics.b2Contact = B2Contact ;
          
        B2Contact.prototype.GetFixtureA = function(){ return this.m_fixtureA ; } ;
        B2Contact.prototype.GetFixtureB = function(){ return this.m_fixtureB ; } ;
        B2Contact.prototype.IsTouching  = function(){ return this.m_touching ; } ;
       
        //GetNext():b2Contact
    
        // ***************************************************************************
        //                                Contact listener
        // ***************************************************************************
      
        var B2ContactListener = function () {};
        window.Box2D.Dynamics.b2ContactListener = B2ContactListener ;
    
        B2ContactListener.prototype.BeginContact = function (/*contact*/) {} ;// NOTE: Only this one is called at the moment
        B2ContactListener.prototype.EndContact   = function (/*contact*/) {} ;
        B2ContactListener.prototype.PreSolve     = function (/*contact, oldManifold*/) {} ;
        B2ContactListener.prototype.PostSolve    = function (/*contact, impulse*/) {} ;
       
        window.Box2D.Dynamics.b2ContactListener.b2_defaultListener = new B2ContactListener();
       
        // ***************************************************************************
        //                            b2ContactFilter
        // ***************************************************************************

        var B2ContactFilter = function() {} ;

        window.Box2D.Dynamics.b2ContactFilter = B2ContactFilter ;

        // ***************************************************************************
        //                                b2World
        // ***************************************************************************

        var B2World = function (gravity, doSleep) {
            this.m_bodyList = [];
            this.m_jointList = [];
            this.m_fixturesList = [];
            this.m_contactListener = null ;
            this.m_jointsList = [] ;
    
            this.m_worldID = window.ext.IDTK_SRV_BOX2D.makeCall( "createWorld" , gravity.x , gravity.y , doSleep );
        };

        window.Box2D.Dynamics.b2World = B2World;
    
        B2World.prototype.SetContactListener = function (listener) { this.m_contactListener = listener ; } ;

        B2World.prototype.SetContactFilter = function(filter){
            var _filter = filter ;
            var world = this ;
            var callbackFunc = function(a , b){
                var fa = world.m_fixturesList[a];
                var fb = world.m_fixturesList[b];
                return _filter.ShouldCollide(fa,fb);
            };
            window.ext.IDTK_SRV_BOX2D.makeCall("setContactFilter", this.m_worldID, callbackFunc ) ;
        };
         
        B2World.prototype.CreateBody = function (def) {
            var b = new B2Body(def, this);
            this.m_bodyList[b.m_bodyID] = b;
            return b;
        };
    
        B2World.prototype.DestroyBody = function (b) {
            window.ext.IDTK_SRV_BOX2D.makeCall( "deleteBody" , this.m_worldID , b.m_bodyID ) ; 
            delete this.m_bodyList[b.m_bodyID];
            for( var i =0 ; i < b.m_fixtures.length ; ++i ){
                delete this.m_fixturesList[b.m_fixtures[i].m_fixtureID] ;
            }
        };
    
        B2World.prototype.CreateJoint = function (def) {
            if( def.bodyA.m_bodyID === def.bodyB.m_bodyID ){
                return ;
            }
          
            var bodyA = def.bodyA ;
            var bodyB = def.bodyB ;
            def.bodyA = bodyA.m_bodyID ;
            def.bodyB = bodyB.m_bodyID ;
    
            var jointFunc = "createDistanceJoint" ;
            if( def.type === B2Joint.e_revoluteJoint ) {
                jointFunc = "createRevoluteJoint" ;
            }
            
            var joint = new B2Joint(def) ;

            joint.m_jointID = window.ext.IDTK_SRV_BOX2D.makeCall( jointFunc , this.m_worldID , def ) ;
    
            def.bodyA = bodyA ;
            def.bodyB = bodyB ;
            
            this.m_jointsList.push( joint ) ;
    
            return joint ;
        };

        B2World.prototype.DestroyJoint = function (joint) {
            window.ext.IDTK_SRV_BOX2D.makeCall( "destroyJoint" , this.m_worldID , joint.m_jointID ) ;
        };
    
        B2World.prototype.GetJointList = function () {
            if( this.m_jointsList.length === 0 ){
                return null ;
            }
    
            // Build the linked-list impersonation inside of the array
            for( var i = 0 ; i < this.m_jointsList.length - 1 ; ++i ){
                this.m_jointsList[i].next = this.m_jointsList[i+1] ;
            }
    
            this.m_jointsList[this.m_jointsList.length-1].next = null ;
    
            return this.m_jointsList[0];
        };
       
        B2World.prototype.SetContinuousPhysics = function (continuous) { window.ext.IDTK_SRV_BOX2D.makeCall( "setContinuous" , this.m_worldID, continuous ) ; } ;
        B2World.prototype.SetGravity           = function (gravity) { window.ext.IDTK_SRV_BOX2D.makeCall( "setGravity" , this.m_worldID, gravity.x , gravity.y ) ; } ;
       
        B2World.prototype.Step = function (dt, velocityIterations, positionIterations) {
            var i;
            var transforms = window.ext.IDTK_SRV_BOX2D.makeCall( "step" , this.m_worldID, dt , velocityIterations , positionIterations );
       
            var count = transforms[0]; // Array returns [ <number of elements> , elem1.bodyID , elem1.posX , elem1.posY , elem1.angle, elem2.bodyID , ....]
    
            for( i = 1; i <= count * 4 ; i+=4 ){
                var body = this.m_bodyList[ transforms[i+0] ];
    
                if( body === null ){ // end of the transforms array
                    break ;
                }
             
                body.m_xf.position.Set(transforms[i+1] ,transforms[i+2] ) ;
                body.m_xf.R.Set(transforms[i+3]);
            }
    
            // Handle object contacts
            if( this.m_contactListener !== null ){
                var contacts = window.ext.IDTK_SRV_BOX2D.makeCall( "getLastContacts" , this.m_worldID );
                count = contacts[0];
                for( i = 1 ; i<= count*3 ; i+=3 ){
                    var f1 = contacts[i+0];
                    var f2 = contacts[i+1];
                    var touching = contacts[i+2];
    
                    var fix1 = this.m_fixturesList[f1];
                    var fix2 = this.m_fixturesList[f2];
                    if( (typeof(fix1) === 'undefined' ) || (typeof(fix2) === 'undefined' ) ){
                        console.log("One of the fixtures in a contact DOESN'T EXIST!!");
                        continue ;
                    }
    
                    this.m_contactListener.BeginContact( new B2Contact(fix1,fix2,touching) ) ;
                }
            }
        };
    
        B2World.prototype.ClearForces = function () {
            window.ext.IDTK_SRV_BOX2D.makeCall( "clearForces" , this.m_worldID );
        };
    
        B2World.prototype.SetDebugDraw = function(/*d*/){} ;
        B2World.prototype.DrawDebugData = function(){};
    
        // ***************************************************************************
        //                                Shapes
        // ***************************************************************************
    
        window.Box2D.Collision.Shapes.b2CircleShape = function (radius){
            this.radius = radius ;
            this.type = "circle";
        };
    
        window.Box2D.Collision.Shapes.b2PolygonShape = function (){
            this.SetAsBox = function (width,height){
                this.type = "box";
                this.width  = width  ;
                this.height = height ;
            };
            
            this.SetAsEdge = function (v1, v2){
                this.type = "edge";
                this.p1x = v1.x;
                this.p1y = v1.y;
                this.p2x = v2.x;
                this.p2y = v2.y;
            };

            this.SetAsArray = function ( vec , length ){
                this.type = "polygon";
                this.vertices = [] ;
             
                for( var i = 0; i < length ; i++ ){
                    this.vertices.push( vec[i].x );
                    this.vertices.push( vec[i].y );
                }
            };
        };
    
        // ***************************************************************************
        //                                b2FixtureDef
        // ***************************************************************************
    
        var b2FixtureDef = function () {
            this.shape = null;
            this.userData = null;
            this.friction = 0.2;
            this.restitution = 0.0;
            this.density = 0.0;
            this.isSensor = false;
            this.filter = {
                categoryBits : 1 ,
                maskBits : 0xFFFF ,
                groupIndex : 0
            } ;
        };
    
        window.Box2D.Dynamics.b2FixtureDef = b2FixtureDef ;
       
        // ***************************************************************************
        //                             b2Joint
        // ***************************************************************************
    
        var B2Joint = function( def ) {
            this.bodyA = def.bodyA;
            this.bodyB = def.bodyB;
            this.userData = def.userData ;
            this.type = def.type ;
            this.next = null ;
        };
      
        window.Box2D.Dynamics.Joints.b2Joint = B2Joint ;
    
        B2Joint.prototype.GetBodyA    = function() { return this.bodyA    ; } ;
        B2Joint.prototype.GetBodyB    = function() { return this.bodyB    ; } ;
        B2Joint.prototype.GetUserData = function() { return this.userData ; } ;
        B2Joint.prototype.GetType     = function() { return this.type     ; } ;
        B2Joint.prototype.GetNext     = function() { return this.next     ; } ;
      
        B2Joint.e_distanceJoint = 0 ;
        B2Joint.e_revoluteJoint = 1 ;
          
        // ***************************************************************************
        //                             b2DistanceJointDef
        // ***************************************************************************
    
        var B2DistanceJointDef = function( bA , bB , anchorA , anchorB ) {
            this.type = B2Joint.e_distanceJoint ;
            this.localAnchorA = new B2Vec2() ;
            this.localAnchorB = new B2Vec2() ;
            this.userData = null ;
    
            if( bA !== undefined ){this.bodyA = bA ;}
            if( bB !== undefined ){this.bodyB = bB ;}
            if( anchorA !== undefined ){this.localAnchorA.SetV(anchorA) ;}
            if( anchorB !== undefined ){this.localAnchorB.SetV(anchorB) ;}
    
            if( anchorA !== undefined && anchorB !== undefined ){
                var dX = anchorB.x - anchorA.x ;
                var dY = anchorB.y - anchorA.y ;
                this.length = Math.sqrt(dX * dX + dY * dY) ;
            }
            this.frequencyHz  = 0.0 ;
            this.dampingRatio = 0.0 ;
        };
    
        window.Box2D.Dynamics.Joints.b2DistanceJointDef = B2DistanceJointDef ;
 
        // ***************************************************************************
        //                             b2RevoluteJointDef
        // ***************************************************************************
    
        var B2RevoluteJointDef = function( bA , bB , anchorA , anchorB ) {
            this.type = B2Joint.e_revoluteJoint ;
            this.localAnchorA = new B2Vec2() ;
            this.localAnchorB = new B2Vec2() ;
            this.userData = null ;
    
            if( bA !== undefined ){this.bodyA = bA ;}
            if( bB !== undefined ){this.bodyB = bB ;}
            if( anchorA !== undefined ){this.localAnchorA.SetV(anchorA) ;}
            if( anchorB !== undefined ){this.localAnchorB.SetV(anchorB) ;}
    
            this.referenceAngle = 0.0;
            this.lowerAngle = 0.0;
            this.upperAngle = 0.0;
            this.maxMotorTorque = 0.0;
            this.motorSpeed = 0.0;
            this.enableLimit = false;
            this.enableMotor = false;
        };

        B2RevoluteJointDef.prototype.Initialize = function (bA, bB, anchor) {
            this.bodyA = bA;
            this.bodyB = bB;
            this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
            this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
            this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
        };
    
        window.Box2D.Dynamics.Joints.b2RevoluteJointDef = B2RevoluteJointDef ;

    })();
}

Cocoon.define("Cocoon.Device" , function(extension){
    "use strict";
    /**
    * All functions related to the device.
    * @namespace Cocoon.Device
    */

    /**
     * An object that defines the getDeviceInfo returned information.
     * @memberof Cocoon.Device
     * @name DeviceInfo
     * @property {object} Cocoon.Device.DeviceInfo - The object itself
     * @property {string} Cocoon.Device.DeviceInfo.os The operating system name (ios, android,...).
     * @property {string} Cocoon.Device.DeviceInfo.version The operating system version (4.2.2, 5.0,...).
     * @property {string} Cocoon.Device.DeviceInfo.dpi The operating system screen density in dpi.
     * @property {string} Cocoon.Device.DeviceInfo.brand  The device manufacturer (apple, samsung, lg,...).
     * @property {string} Cocoon.Device.DeviceInfo.model The device model (iPhone 4S, SAMSUNG-SGH-I997, SAMSUNG-SGH-I997R, etc).
     * @property {string} Cocoon.Device.DeviceInfo.imei The phone IMEI.
     * <br/>Android: The phone IMEI is returned or null if the device has not telephony.
     * <br/>iOS: null is returned as we cannot get the IMEI in iOS, no public API available for that yet.
     * @property {string} Cocoon.Device.DeviceInfo.platformId The platform Id.
     * @property {string} Cocoon.Device.DeviceInfo.odin The Odin generated id: https://code.google.com/p/odinmobile/
     * @property {string} Cocoon.Device.DeviceInfo.openudid The OpenUDID generated Id: https://github.com/ylechelle/OpenUDID
     */
    extension.DeviceInfo = {
        os:         null,
        version:    null,
        dpi:        null,
        brand:      null,
        model:      null,
        imei:       null,
        platformId: null,
        odin:       null,
        openudid:   null
    };

    /**
    * Returns the device UUID.
    * @function getDeviceId
    * @memberof Cocoon.Device
    * @return {string} The device UUID
    * @example
    * console.log(Cocoon.Device.getDeviceId());
    */
    extension.getDeviceId = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceId");
        }
    };

    /**
     * Returns the device Info.
     * @function getDeviceInfo
     * @memberof Cocoon.Device
     * @return {Cocoon.Device.DeviceInfo} The device Info
     * @example
     * console.log( JSON.stringify(Cocoon.Device.getDeviceInfo()) );
     */
    extension.getDeviceInfo = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getDeviceInfo");
        }
    };

    /**
    * Retrieves the preferred orientation that has been set in the system.
    * @function getOrientation
    * @memberof Cocoon.Device
    * @return {number} The preferred orientation in the system as a combination of the possible {@link Cocoon.Device.Orientations}.
    * @example
    * console.log(Cocoon.Device.getOrientation());
    */
    extension.getOrientation = function() {
        if (Cocoon.nativeAvailable) {
            return window.ext.IDTK_APP.makeCall("getPreferredOrientation");
        }
        else {
            return 0;
        }
    };

    /**
    * Sets the preferred orientation in the system.
    * @function setOrientation
    * @memberof Cocoon.Device
    * @param {number} preferredOrientation The preferred orientation to be set. A combination of the possible {@link Cocoon.Device.Orientations}.
    * @example
    * Cocoon.Device.setOrientation(Cocoon.Device.Orientations.PORTRAIT);
    */
    extension.setOrientation = function(preferredOrientation) {
        if (Cocoon.nativeAvailable) {
            window.ext.IDTK_APP.makeCall("setPreferredOrientation", preferredOrientation);
        }
    };

    /**
     * The predefined possible orientations. There can be a bit level combination of them using the OR operator.
     * @memberof Cocoon.Device
     * @name Cocoon.Device.Orientations
     * @property {string} Cocoon.Device.Orientations - The base object
     * @property {string} Cocoon.Device.Orientations.PORTRAIT - Portrait
     * @property {string} Cocoon.Device.Orientations.PORTRAIT_UPSIDE_DOWN - Portrait upside-down
     * @property {string} Cocoon.Device.Orientations.LANDSCAPE_LEFT - Landscape left
     * @property {string} Cocoon.Device.Orientations.LANDSCAPE_RIGHT - Landscape right
     * @property {string} Cocoon.Device.Orientations.LANDSCAPE - Landscape
     * @property {string} Cocoon.Device.Orientations.BOTH - Both
     */
    extension.Orientations = {
        PORTRAIT : 1,
        PORTRAIT_UPSIDE_DOWN : 2,
        LANDSCAPE_LEFT : 4,
        LANDSCAPE_RIGHT : 8,
        LANDSCAPE : 4 | 8,
        BOTH : 1 | 2 | 4 | 8
    };

    /**
     * Enables or disables the auto lock to control if the screen keeps on after an inactivity period.
     * When the auto lock is enabled and the application has no user input for a short period, the system puts the device into a "sleep” state where the screen dims or turns off.
     * When the auto lock is disabled the screen keeps on even when there is no user input for long times.
     * @function autoLock
     * @name autoLock
     * @memberof Cocoon.Device
     * @param {Bool} enabled A boolean value that controls whether to enable or disable the auto lock.
     * @example
     * Cocoon.Device.autoLock(false);
     */
    extension.autoLock = function (enabled) {
        if (Cocoon.nativeAvailable) {
            return Cocoon.callNative("IDTK_APP", "setAutoLockEnabled", arguments);
        }
    };

    return extension;

});
/**
* Dialog functions (prompt / confirm).
* @namespace Cocoon.Dialog
*/
Cocoon.define("Cocoon.Dialog", function (extension) {
    "use strict";

    /**
* @property {object} Cocoon.Dialog.keyboardType Types of input keyboard.
* @property {string} Cocoon.Dialog.keyboardType.TEXT Represents a generic text input keyboard.
* @property {string} Cocoon.Dialog.keyboardType.NUMBER Represents a number like input keyboard.
* @property {string} Cocoon.Dialog.keyboardType.PHONE Represents a phone like input keyboard.
* @property {string} Cocoon.Dialog.keyboardType.EMAIL Represents an email like input keyboard.
* @property {string} Cocoon.Dialog.keyboardType.URL Represents an URL like input keyboard.
* @memberOf Cocoon.Dialog
* @name Cocoon.Dialog.keyboardType
*/
    extension.keyboardType = {

        TEXT: "text",

        NUMBER: "num",

        PHONE: "phone",

        EMAIL: "email",

        URL: "url"
    };

    /**
     * Pops up a text dialog so the user can introduce some text and the application can get it back. It is the first approach Cocoon has taken to be able to introduce
     * text input in a easy way. The dialog execution events are passed to the application through the {@link Cocoon.Dialog.onTextDialogFinished} and the {@link Cocoon.Dialog.onTextDialogCancelled} event objects.
     * @param {object} param Object information.
     * @param [param.title] {string} The title to be displayed in the dialog.
     * @param [param.message] {string} The message to be displayed in the dialog, next to the text input field.
     * @param [param.text] {string} The initial text to be introduced in the text input field.
     * @param [param.type] {Cocoon.Dialog.keyboardType} Default value is Cocoon.Dialog.keyboardType.TEXT. The keyboard type to be used when the text has to be introduced.
     * @param [param.cancelText] {string} Default value is "Cancel". The text to be displayed in the cancel button of the dialog.
     * @param [param.confirmText] {string} Default value is "Ok". The text to be displayed in the ok button of the dialog.
     * @param [param.secureText] {boolean} Default value is "false". The text to be displayed as secure (password-like).
     * @param {callback} callbacks - <i>success</i> and <i>cancel</i> callbacks called when the user confirms or cancel the dialog.
     * @memberOf Cocoon.Dialog
     * @function prompt
     * @example 
     * Cocoon.Dialog.prompt({ 
     *     title : "title",
     *     message : "message"
     * },{
     *     success : function(text){ ... },
     *     cancel : function(){ ... }
     * });
     */

    extension.prompt = function (params, callbacks) {

        if (!callbacks) throw ("Callback missing for Cocoon.Dialog.prompt();");
        var defaultKeyboard = Cocoon.Dialog.keyboardType.TEXT;

        switch (params.type) {
            case Cocoon.Dialog.keyboardType.TEXT:
                defaultKeyboard = Cocoon.Dialog.keyboardType.TEXT;
                break;
            case Cocoon.Dialog.keyboardType.NUMBER:
                defaultKeyboard = Cocoon.Dialog.keyboardType.NUMBER;
                break;
            case Cocoon.Dialog.keyboardType.PHONE:
                defaultKeyboard = Cocoon.Dialog.keyboardType.PHONE;
                break;
            case Cocoon.Dialog.keyboardType.EMAIL:
                defaultKeyboard = Cocoon.Dialog.keyboardType.EMAIL;
                break;
            case Cocoon.Dialog.keyboardType.URL:
                defaultKeyboard = Cocoon.Dialog.keyboardType.URL;
                break;
        }

        var properties = {
            title: "",
            message: "",
            text: "",
            type: defaultKeyboard,
            cancelText: "Cancel",
            confirmText: "Ok",
            secureText: false
        };

        var args = Cocoon.clone(properties, params);

        var succedListener = function () {
            Cocoon.Dialog.onTextDialogCancelled.removeEventListener(errorListener);
            Cocoon.Dialog.onTextDialogFinished.removeEventListener(succedListener);
            callbacks.success.apply(window, Array.prototype.slice.call(arguments));
        };

        var errorListener = function () {
            Cocoon.Dialog.onTextDialogCancelled.removeEventListener(errorListener);
            Cocoon.Dialog.onTextDialogFinished.removeEventListener(succedListener);
            callbacks.cancel.apply(window, Array.prototype.slice.call(arguments));
        };

        Cocoon.Dialog.onTextDialogCancelled.addEventListener(errorListener);
        Cocoon.Dialog.onTextDialogFinished.addEventListener(succedListener);

        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "showTextDialog", args, true);
        } else {
            setTimeout(function () {
                var result = prompt(properties.message, properties.text);
                var eventObject = result ? Cocoon.Dialog.onTextDialogFinished : Cocoon.Dialog.onTextDialogCancelled;
                eventObject.notifyEventListeners(result);
            }, 0);
        }
    };

    /**
     * Pops up a message dialog so the user can decide between a yes or no like confirmation.
     * @function
     * @param {object} params
     * @param params.title Default value is "". The title to be displayed in the dialog.
     * @param params.message Default value is "". The message to be displayed in the dialog, next to the text input field.
     * @param params.confirmText Default value is "Ok". The text to be displayed for the confirm button.
     * @param params.cancelText  Default value is "Cancel". The text to be displayed for the deny button.
     * @param {function} callback - Called when the user accepts or cancel the dialog, it receives an argument true/false.
     * @memberOf Cocoon.Dialog
     * @function confirm
     * @example
     * Cocoon.Dialog.confirm({
     *  title : "This is the title",
     *  message : "Awesome message"
     * }, function(accepted){
     *  if(accepted){
     *      alert("The user has accepted the dialog");
     *  }else{
     *      alert("The user has denied the dialog");
     *  }
     * });
     */
    extension.confirm = function (params, callback) {

        if (!callback) throw ("Callback missing for Cocoon.Dialog.confirm();");

        var properties = {
            title: "",
            message: "",
            cancelText: "Cancel",
            confirmText: "Ok"
        };

        var args = Cocoon.clone(properties, params);

        var succedListener = function () {
            Cocoon.Dialog.onMessageBoxDenied.removeEventListenerOnce(errorListener);
            callback(true);
        };

        var errorListener = function () {
            Cocoon.Dialog.onMessageBoxConfirmed.removeEventListenerOnce(succedListener);
            callback(false);
        };

        Cocoon.Dialog.onMessageBoxDenied.addEventListenerOnce(errorListener);
        Cocoon.Dialog.onMessageBoxConfirmed.addEventListenerOnce(succedListener);

        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "showMessageBox", args, true);
        } else {
            setTimeout(function () {
                var result = confirm(properties.message);
                var eventObject = result ? Cocoon.Dialog.onMessageBoxConfirmed : Cocoon.Dialog.onMessageBoxDenied;
                eventObject.notifyEventListeners();
            }, 0);
        }
    };

    /**
      * Shows a keyboard to receive user input. The developer has to process input events and render the resulting text.
      * @param {object} param Object information.
      * @param [param.type] {Cocoon.Dialog.keyboardType} Default value is Cocoon.Dialog.keyboardType.TEXT. The keyboard type to be used when the text has to be introduced.
      * @param {callback} callbacks - <i>insertText</i>, <i>deleteBackward</i>, <i>done</i>, <i>cancel</i> callbacks called when the user clicks a key, confirms or cancels the keyboard session.
      * @memberOf Cocoon.Dialog
      * @function showKeyboard
      * @example 
      * var text = "";
      * Cocoon.Dialog.showKeyboard({
      *     type: Cocoon.Dialog.keyboardType.TEXT,
      * }, {
      *     insertText: function(inserted) {
      *         text += inserted;
      *         console.log(text);
      *     },
      *     deleteBackward: function() {
      *         text = text.slice(0, text.length - 1);
      *         console.log(text);
      *     },
      *     done: function() {
      *         console.log("user clicked done key");
      *     },
      *     cancel: function() {
      *         console.log("user dismissed keyboard");
      *     }
      * });
      */
    extension.showKeyboard = function (params, callbacks) {
        params = params || {};
        params.type = params.type || Cocoon.Dialog.keyboardType.TEXT;
        var insertCallback = callbacks && callbacks.insertText;
        var deleteCallback = callbacks && callbacks.deleteBackward;
        var doneCallback = callbacks && callbacks.done;
        var cancelCallback = callbacks && callbacks.cancel;

        if (Cocoon.nativeAvailable()) {
            Cocoon.callNative("IDTK_APP", "showKeyboard",
                [params, insertCallback, deleteCallback, doneCallback, cancelCallback], true);
        }
    };

    /**
      * Dismisses a keyboard which was previusly shown by {@link Cocoon.Dialog.showKeyboard}
      *
      * @memberOf Cocoon.Dialog
      * @function dismissKeyboard
      * @example 
      * var text = "";
      * Cocoon.Dialog.showKeyboard({
      *     type: Cocoon.Dialog.keyboardType.TEXT,
      * }, {
      *     insertText: function(inserted) {
      *         if (inserted === "A") { //Custom keyboard hide
      *             Cocoon.Dialog.dismissKeyboard();
      *         }
      *         text += inserted;
      *         console.log(text);
      *     },
      *     deleteBackward: function() {
      *         text = text.slice(0, text.length - 1);
      *         console.log(text);
      *     },
      *     done: function() {
      *         console.log("user clicked done key");
      *     },
      *     cancel: function() {
      *         console.log("user dismissed keyboard");
      *     }
      * });
      */
    extension.dismissKeyboard = function () {
        if (Cocoon.nativeAvailable()) {
            Cocoon.callNative("IDTK_APP", "dismissKeyboard", [], true);
        }
    };

    /**
     * Allows listening to events called when the text dialog is finished by accepting it's content.
     * The callback function's documentation is represented by {@link Cocoon.Dialog.OnTextDialogFinishedListener}
     * @event
     * @static
     * @private
     * @memberOf Cocoon.Dialog
     */
    extension.onTextDialogFinished = new Cocoon.EventHandler("IDTK_APP", "App", "ontextdialogfinish");

    /**
     * Allows listening to events called when the text dialog is finished by dismissing it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @private
     * @memberOf Cocoon.Dialog
     */
    extension.onTextDialogCancelled = new Cocoon.EventHandler("IDTK_APP", "App", "ontextdialogcancel");

    /**
     * Allows listening to events called when the text dialog is finished by accepting it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @private
     * @memberOf Cocoon.Dialog
     */
    extension.onMessageBoxConfirmed = new Cocoon.EventHandler("IDTK_APP", "App", "onmessageboxconfirmed");

    /**
     * Allows listening to events called when the text dialog is finished by dismissing it's content.
     * The callback function does not receive any parameter.
     * @event
     * @static
     * @private
     * @memberOf Cocoon.Dialog
     */
    extension.onMessageBoxDenied = new Cocoon.EventHandler("IDTK_APP", "App", "onmessageboxdenied");

    return extension;

});

Cocoon.define("Cocoon.Motion", function (extension) {
    "use strict";
    /**
    * All functions related to the Accelerometer and Gyroscope.
    * @namespace Cocoon.Motion
    */
    extension.nativeAvailable = function () {
        return Cocoon.nativeAvailable;
    };

    /**
     * Setups the update interval in seconds (1 second / X frames) to receive the accelerometer updates.
     * It defines the rate at which the devicemotion events are updated.
     * @function setAccelerometerInterval
     * @memberOf Cocoon.Motion
     * @param {number} seconds The update interval in seconds to be set.
     * @example
     * Cocoon.Motion.setAccelerometerInterval(2);
     */
    extension.setAccelerometerInterval = function (updateIntervalInSeconds) {
        if (Cocoon.Motion.nativeAvailable()) {
            return window.ext.IDTK_APP.makeCall("setAccelerometerUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };

    /**
     * Returns the update interval in seconds that is currently set for accelerometer related events.
     * @function getAccelerometerInterval
     * @memberOf Cocoon.Motion
     * @return {number} The update interval in seconds that is currently set for accelerometer related events.
     * @example
     * console.log(Cocoon.Motion.getAccelerometerInterval());
     */
    extension.getAccelerometerInterval = function () {
        if (Cocoon.Motion.nativeAvailable()) {
            return window.ext.IDTK_APP.makeCall("getAccelerometerUpdateIntervalInSeconds");
        }
    };

    /**
     * Setups the update interval in seconds (1 second / X frames) to receive the gyroscope updates.
     * It defines the rate at which the devicemotion and deviceorientation events are updated.
     * @function setGyroscopeInterval
     * @memberOf Cocoon.Motion
     * @param {number} seconds The update interval in seconds to be set.
     * @example
     * Cocoon.Motion.setGyroscopeInterval(2);
     */
    extension.setGyroscopeInterval = function (updateIntervalInSeconds) {
        if (Cocoon.Motion.nativeAvailable()) {
            return window.ext.IDTK_APP.makeCall("setGyroscopeUpdateIntervalInSeconds", updateIntervalInSeconds);
        }
    };

    /**
     * Returns the update interval in seconds that is currently set for gyroscope related events.
     * @function getGyroscopeInterval
     * @memberOf Cocoon.Motion
     * @return {number} The update interval in seconds that is currently set for gyroscope related events.
     * @example
     * console.log(Cocoon.Motion.getGyroscopeInterval());
     */
    extension.getGyroscopeInterval = function () {
        if (Cocoon.Motion.nativeAvailable()) {
            window.ext.IDTK_APP.makeCall("getGyroscopeUpdateIntervalInSeconds");
        }
    };

    return extension;

});
Cocoon.define("Cocoon.App", function (extension) {

    function checkEmulatedWebViewReady() {
        var emulatedWB = Cocoon.App.EmulatedWebView;
        if (emulatedWB) {
            return; //ready
        }

        emulatedWB = document.createElement('div');
        emulatedWB.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewDiv');
        emulatedWB.style.width = 0;
        emulatedWB.style.height = 0;
        emulatedWB.style.position = "absolute";
        emulatedWB.style.left = 0;
        emulatedWB.style.top = 0;
        emulatedWB.style.backgroundColor = 'transparent';
        emulatedWB.style.border = "0px solid #000";

        var frame = document.createElement("IFRAME");
        frame.setAttribute('id', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
        frame.setAttribute('name', 'CocoonJS_App_ForCocoonJS_WebViewIFrame');
        frame.style.width = 0;
        frame.style.height = 0;
        frame.frameBorder = 0;
        frame.allowtransparency = true;

        emulatedWB.appendChild(frame);
        Cocoon.App.EmulatedWebView = emulatedWB;
        Cocoon.App.EmulatedWebViewIFrame = frame;

        if (!document.body) {
            document.body = document.createElement("body");
        }
        document.body.appendChild(Cocoon.App.EmulatedWebView);
    }

    /**
     * Pauses the Cocoon JavaScript execution loop.
     * The callback function does not receive any parameter.
     * @function pause
     * @memberOf Cocoon.App
     * @example
     * Cocoon.App.pause();
     */
    extension.pause = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "pause", arguments);
        }
    };
    /**
     * Resumes the Cocoon JavaScript execution loop.
     * @function resume
     * @memberOf Cocoon.App
     * @example
     * Cocoon.App.resume();
     */

    extension.resume = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "resume", arguments);
        }
    };

    /**
    * Loads a resource in the WebView environment from the Cocoon environment.
    * @function loadInTheWebView
    * @memberOf Cocoon.App
    * @param {string} path The path to the resource. It can be a remote URL or a path to a local file.
    * @param {Cocoon.App.StorageType} [storageType] An optional parameter to specify at which storage in the device the file path is stored. By default, APP_STORAGE is used.
    * @example
    * Cocoon.App.WebView.on("load", {
    *   success : function(){
    *     Cocoon.App.showTheWebView();
    *   },
    *   error : function(){
    *     console.log("Cannot show the Webview for some reason :/");
    *     console.log(JSON.stringify(arguments));
    *   }
    * });
    * Cocoon.App.loadInTheWebView("wv.html");
    */
    extension.loadInTheWebView = function (path, storageType) {
        if (navigator.isCocoonJS && Cocoon.App.nativeAvailable()) {
            Cocoon.callNative("IDTK_APP", "loadInTheWebView", arguments);
        }
        else {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if ((xhr.status >= 200 && xhr.status <= 299) || xhr.status === 0) {

                        checkEmulatedWebViewReady();
                        var callback = function (event) {
                            Cocoon.App.onLoadInTheWebViewSucceed.notifyEventListeners(path);
                            Cocoon.App.EmulatedWebViewIFrame.removeEventListener("load", callback);
                        };

                        Cocoon.App.EmulatedWebViewIFrame.addEventListener(
                            "load",
                            callback
                        );
                        Cocoon.App.EmulatedWebViewIFrame.contentWindow.location.href = path;
                    }
                    else {
                        this.onreadystatechange = null;
                        Cocoon.App.onLoadInTheWebViewFailed.notifyEventListeners(path);
                    }
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        }
    };

    /**
     * Reloads the last loaded path in the WebView context.
     * @function reloadWebView
     * @memberOf Cocoon.App
     * @example
     * Cocoon.App.reloadWebView();
     */
    extension.reloadWebView = function () {
        if (Cocoon.App.nativeAvailable() && navigator.isCocoonJS) {
            Cocoon.callNative("IDTK_APP", "reloadWebView", arguments);
        }
        else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebViewIFrame.contentWindow.location.reload();
        }
    };

    /**
    * Shows the webview.
    * @function showTheWebView
    * @memberOf Cocoon.App
    * @param {number}  x The top lef x coordinate of the rectangle where the webview will be shown.
    * @param {number}  y The top lef y coordinate of the rectangle where the webview will be shown.
    * @param {number}  width The width of the rectangle where the webview will be shown.
    * @param {number}  height The height of the rectangle where the webview will be shown.
    * @example
    * Cocoon.App.showTheWebView(0 , 0 , window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    */
    extension.showTheWebView = function (x, y, width, height) {
        if (Cocoon.App.nativeAvailable() && navigator.isCocoonJS) {
            Cocoon.callNative("IDTK_APP", "showTheWebView", arguments);
        }
        else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebViewIFrame.style.width = (width ? width / window.devicePixelRatio : window.innerWidth) + 'px';
            Cocoon.App.EmulatedWebViewIFrame.style.height = (height ? height / window.devicePixelRatio : window.innerHeight) + 'px';
            Cocoon.App.EmulatedWebView.style.left = (x ? x : 0) + 'px';
            Cocoon.App.EmulatedWebView.style.top = (y ? y : 0) + 'px';
            Cocoon.App.EmulatedWebView.style.width = (width ? width / window.devicePixelRatio : window.innerWidth) + 'px';
            Cocoon.App.EmulatedWebView.style.height = (height ? height / window.devicePixelRatio : window.innerHeight) + 'px';
            Cocoon.App.EmulatedWebView.style.display = "block";

        }
    };

    /**
    * Hides the webview.
    * @function hideTheWebView
    * @memberOf Cocoon.App
    * @example
    * Cocoon.App.hideTheWebView();
    */
    extension.hideTheWebView = function () {
        if (Cocoon.App.nativeAvailable() && navigator.isCocoonJS) {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('hide');";
            return Cocoon.App.forwardAsync(javaScriptCodeToForward);
        }
        else {
            checkEmulatedWebViewReady();
            Cocoon.App.EmulatedWebView.style.display = "none";
        }
    };

    /**
    * @private
    * @function forwardedEventFromTheWebView
    * @memberOf Cocoon.App
    */
    extension.forwardedEventFromTheWebView = function (eventName, eventDataString) {
        var eventData = JSON.parse(eventDataString);
        eventData.target = window;
        var event = new Event(eventName);
        for (var att in eventData) {
            event[att] = eventData[att];
        }
        event.target = window;
        window.dispatchEvent(event);
        var canvases = document.getElementsByTagName("canvas");
        for (var i = 0; i < canvases.length; i++) {
            event.target = canvases[i];
            canvases[i].dispatchEvent(event);
        }
    };

    extension.onLoadInTheWebViewSucceed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpageload");

    extension.onLoadInTheWebViewFailed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpagefail");

    var signal = new Cocoon.createSignal();

    signal.register("load", {
        success: extension.onLoadInTheWebViewSucceed,
        error: extension.onLoadInTheWebViewFailed
    });

    extension.WebView = Cocoon.WebView || {};
    extension.WebView.on = signal.expose();

    return extension;
});
/*jshint loopfunc: true */

Cocoon.define("Cocoon.Proxify", function (extension) {
    "use strict";
    /**
    * Proxies different functions of the WebView environment, like Audio objects and XHR.
    * @namespace Cocoon.Proxify
    */

    /**
    * @function getKeyForValueInDictionary
    * @memberof Cocoon.WebView
    * @private
    */
    extension.getKeyForValueInDictionary = function (dictionary, value) {
        var finalKey = null;
        for (var key in dictionary) {
            if (dictionary[key] === value) {
                finalKey = key;
                break;
            }
        }
        return finalKey;
    };

    /**
    * Setups a origin proxy for a given typeName. What this means is that after calling this function the environment that makes this call will suddenly
    * have a way of creating instances of the given typeName and those instances will act as a transparent proxy to counterpart instances in the destination environment.
    * Manipulating attributes, calling funcitions or handling events will all be performed in the destination environment but the developer will think they will be
    * happening in the origin environment.
    * IMPORTANT NOTE: These proxies only work with types that use attributes and function parameters and return types that are primitive like numbers, strings or arrays.
    * @function setupOriginProxyType
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type to be proxified.
    * @param {array} [attributeNames] A list of the names of the attributes to be proxified.
    * @param {array} [functionNames] A list of the names of the functions to be proxified.
    * @param {array} [eventHandlerNames] A list of the names of the event handlers to be proxified (onXXXX like attributes that represent callbacks).
    * A valid typeName and at least one valid array for attribute, function or event handler names is mandatory.
    */
    extension.setupOriginProxyType = function (typeName, attributeNames, functionNames, eventHandlerNames) {
        if (Cocoon.nativeAvailable()) {
            // Control the parameters.
            if (!typeName) throw "The given typeName must be valid.";
            if (!attributeNames && !functionNames && !eventHandlerNames) throw "There is no point on setting up a proxy for no attributes, functions nor eventHandlers.";
            attributeNames = attributeNames ? attributeNames : [];
            functionNames = functionNames ? functionNames : [];
            eventHandlerNames = eventHandlerNames ? eventHandlerNames : [];

            // The parent object will be the window. It could be another object but careful, the destination side should know about this.
            // TODO: Specify the parentObject as a parameter, obtain it's path from the window object and pass it to the destination environment so it knows about it.
            var parentObject = window;

            // Setup the destination side too.
            var jsCode = "Cocoon.Proxify.setupDestinationProxyType(" + JSON.stringify(typeName) + ", " + JSON.stringify(eventHandlerNames) + ");";
            Cocoon.App.forward(jsCode);

            var originalType = parentObject[typeName];

            // Constructor. This will be the new proxified type in the origin environment. Instances of this type will be created by the developer without knowing that they are
            // internally calling to their counterparts in the destination environment.
            parentObject[typeName] = function () {
                var _this = this;

                // Each proxy object will have a origin object inside with all the necessary information to be a proxy to the destination.
                this._cocoonjs_proxy_object_data = {};
                // The id is obtained calling to the destination side to create an instance of the type.
                var jsCode = "Cocoon.Proxify.newDestinationProxyObject(" + JSON.stringify(typeName) + ");";
                this._cocoonjs_proxy_object_data.id = Cocoon.App.forward(jsCode);
                // The eventHandlers dictionary contains objects of the type { eventHandlerName : string, eventHandler : function } to be able to make the callbacks when the 
                // webview makes the corresponding calls.
                this._cocoonjs_proxy_object_data.eventHandlers = {};
                // Also store the typename inside each instance.
                this._cocoonjs_proxy_object_data.typeName = typeName;
                // A dictionary to store the event handlers
                this._cocoonjs_proxy_object_data.eventListeners = {};

                // TODO: eventHandlers and eventListeners should be in the same list ;)

                // Store all the proxy instances in a list that belongs to the type itself.
                parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[this._cocoonjs_proxy_object_data.id] = this;

                // Create a setter and a getter for all the attribute names that have been specified. When the attributes are accessed (set or get) a call to the destination counterpart will be performed.
                for (var i = 0; i < attributeNames.length; i++) {
                    (function (attributeName) {
                        _this.__defineSetter__(attributeName, function (value) {
                            var jsCode = "Cocoon.Proxify.setDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ", " + JSON.stringify(value) + ");";
                            return Cocoon.App.forward(jsCode);
                        });
                        _this.__defineGetter__(attributeName, function () {
                            var jsCode = "Cocoon.Proxify.getDestinationProxyObjectAttribute(" + JSON.stringify(typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(attributeName) + ");";
                            return Cocoon.App.forward(jsCode);
                        });
                    })(attributeNames[i]);
                }

                // Create a function that performs a call to the destination environment counterpart for all the function names that have been specified.
                for (i = 0; i < functionNames.length; i++) {
                    (function (functionName) {
                        _this[functionName] = function () {
                            // Get the arguments as an array and add the typeName, the proxy id and the functionName before all the other arguments before making the call to the destination counterpart.
                            var argumentsArray = Array.prototype.slice.call(arguments);
                            argumentsArray.unshift(functionName);
                            argumentsArray.unshift(this._cocoonjs_proxy_object_data.id);
                            argumentsArray.unshift(typeName);
                            // Use the array to create the correct function call.
                            var jsCode = "Cocoon.Proxify.callDestinationProxyObjectFunction(";
                            for (var i = 0; i < argumentsArray.length; i++) {
                                // The second argument (the id) should not be stringified
                                jsCode += (i !== 1 ? JSON.stringify(argumentsArray[i]) : argumentsArray[i]) + (i < argumentsArray.length - 1 ? ", " : "");
                            }
                            jsCode += ");";
                            // TODO: This next call should be synchronous but it seems that some customers are experiencing some crash issues. Making it async solves these crashes.
                            // Another possible solution could be to be able to specify which calls could be async and which sync in the proxification array.
                            var ret = Cocoon.App.forwardAsync(jsCode);
                            return ret;
                        };
                    })(functionNames[i]);
                }

                // Create a setter and getter for all the event handler names that have been specified. When the event handlers are accessed, store them inside the corresponding position on the eventHandlers
                // array so they can be called when the destination environment makes the corresponding callback call.
                for (i = 0; i < eventHandlerNames.length; i++) {
                    (function (eventHandlerName) {
                        _this.__defineSetter__(eventHandlerName, function (value) {
                            _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName] = value;
                        });
                        _this.__defineGetter__(eventHandlerName, function () {
                            return _this._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                        });
                    })(eventHandlerNames[i]);
                }

                // Setup the add and remove event listeners in the proxy object
                _this.addEventListener = function (eventTypeName, eventCallback) {
                    var addEventCallback = true;
                    // Check for the eventListeners
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        // As the eventListeners were already added, check that the same callback has not been added.
                        addEventCallback = eventListeners.indexOf(eventCallback) < 0;
                    }
                    else {
                        // There are no event listeners, so add the one and add the listeners array for the specific event type name
                        eventListeners = [];
                        _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = eventListeners;

                        // Forward the call so the other end registers a event listener (only one is needed).
                        var jsCode = "Cocoon.Proxify.addDestinationProxyObjectEventListener(" + JSON.stringify(_this._cocoonjs_proxy_object_data.typeName) + ", " + _this._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                        Cocoon.App.forwardAsync(jsCode);
                    }
                    // Only if the alforithm above specify so, add the eventcallback and notify the destination environment to do the same
                    if (addEventCallback) {
                        eventListeners.push(eventCallback);
                    }
                };

                _this.removeEventListener = function (eventTypeName, eventCallback) {
                    // Check for the eventListeners
                    var eventListeners = _this._cocoonjs_proxy_object_data.eventListeners[eventTypeName];
                    if (eventListeners) {
                        var eventCallbackIndex = eventListeners.indexOf(eventCallback);
                        if (eventCallbackIndex >= 0) {
                            eventListeners.splice(eventCallbackIndex, 1);
                        }
                    }
                };

                // Return the proxy instance.
                return this;
            };

            // The type will contain a proxy data structure to store all the instances that are created so they are available when the destination environment calls back. 
            parentObject[typeName]._cocoonjs_proxy_type_data =
                {
                    originalType: originalType,
                    proxyObjects: []
                };

            /**
             * Deletes a proxy instance from both the Cocoon environment structures and also deleting it's webview environment counterpart.
             * This function should be manually called whenever a proxy instance won't be accessed anymore.
             * @param {object} object The proxy object to be deleted.
             */
            parentObject[typeName]._cocoonjs_proxy_type_data.deleteProxyObject = function (object) {
                var proxyObjectKey = extension.getKeyForValueInDictionary(this.proxyObjects, object);
                if (proxyObjectKey) {
                    var jsCode = "Cocoon.Proxify.deleteDestinationProxyObject(" + JSON.stringify(typeName) + ", " + object._cocoonjs_proxy_object_data.id + ");";
                    Cocoon.App.forwardAsync(jsCode);
                    object._cocoonjs_proxy_object_data = null;
                    delete this.proxyObjects[proxyObjectKey];
                }
            };

            /**
             * Calls an event handler for the given proxy object id and an eventHandlerName.
             * @param {number} id The id to be used to look for the proxy object for which to make the call to it's event handler.
             * @param {string} eventHandlerName The name of the handler to be called.
             * NOTE: Events are a complex thing in the HTML specification. This function just performs a call but at least provides a
             * structure to the event passing the target (the proxy object).
             * TODO: The destination should serialize the event object as far as it can so many parameters can be passed to the origin
             * side. Using JSON.stringify in the destination side and parse in origin side maybe? Still must add the target to the event structure though.
             */
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler = function (id, eventHandlerName) {
                var object = this.proxyObjects[id];
                var eventHandler = object._cocoonjs_proxy_object_data.eventHandlers[eventHandlerName];
                if (eventHandler) {
                    eventHandler({ target: object });
                }
            };

            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners = function (id, eventTypeName) {
                var object = this.proxyObjects[id];
                var eventListeners = object._cocoonjs_proxy_object_data.eventListeners[eventTypeName].slice();
                for (var i = 0; i < eventListeners.length; i++) {
                    eventListeners[i]({ target: object });
                }
            };
        }
    };

    /**
    * Takes down the proxification of a type and restores it to it's original type. Do not worry if you pass a type name that is not proxified yet. The
    * function will handle it correctly for compativility reasons.
    * @function takedownOriginProxyType
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type to be deproxified (take down the proxification and restore the type to it's original state)
    */
    extension.takedownOriginProxyType = function (typeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            if (parentObject[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                parentObject[typeName] = parentObject[typeName]._cocoonjs_proxy_type_data.originalType;
            }
        }
    };

    /**
    * Deletes everything related to a proxy object in both environments. Do not worry of you do not pass a proxified object to the
    * function. For compatibility reasons, you can still have calls to this function even when no poxification of a type has been done.
    * @function deleteOriginProxyObject
    * @memberof Cocoon.Proxify
    * @private
    * @param {object} object The proxified object to be deleted.
    */
    extension.deleteOriginProxyObject = function (object) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            if (object && object._cocoonjs_proxy_object_data) {
                parentObject[object._cocoonjs_proxy_object_data.typeName]._cocoonjs_proxy_type_data.deleteProxyObject(object);
            }
        }
    };

    /**
    * Calls the origin proxy object when an event handler need to be updated/called from the destination environment.
    * @function callOriginProxyObjectEventHandler
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The type name of the proxified type.
    * @param {number} id The id of the proxy object.
    * @param {string} eventHandlerName The name of the event handler to be called.
    */
    extension.callOriginProxyObjectEventHandler = function (typeName, id, eventHandlerName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventHandler(id, eventHandlerName);
        }
    };

    /**
    * Calls the origin proxy object when all the event listeners related to a specific event need to be updated/called from the destination environment.
    * @function callOriginProxyObjectEventListeners
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The type name of the proxified type.
    * @param {number} id The id of the proxy object.
    * @param {string} eventTypeName The name of the event type to call the listeners related to it.
    */
    extension.callOriginProxyObjectEventListeners = function (typeName, id, eventTypeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            parentObject[typeName]._cocoonjs_proxy_type_data.callProxyObjectEventListeners(id, eventTypeName);
        }
    };

    /**
    * Setups all the structures that are needed to proxify a destination type to an origin type.
    * @function setupDestinationProxyType
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type to be proxified.
    * @param {array} eventHandlerNames An array with al the event handlers to be proxified. Needed in order to be able to create callbacks for all the event handlers
    * and call to the Cocoon counterparts accordingly.
    */
    extension.setupDestinationProxyType = function (typeName, eventHandlerNames) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;

            // Add a Cocoon structure to the destination proxified type to store some useful information like all the proxy instances that are created, plus the id counter 
            // and the names of all the event handlers and some utility functions.
            parentObject[typeName]._cocoonjs_proxy_type_data =
                {
                    nextId: 0,
                    proxyObjects: {},
                    eventHandlerNames: eventHandlerNames
                };
        }
    };

    /**
    * Takes down the proxy type at the destination environment. Just removes the data structure related to proxies that was added to the type when proxification tool place.
    * @function takedownDestinationProxyType
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type to take the proxification down.
    */
    extension.takedownDestinationProxyType = function (typeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            if (parent[typeName] && parentObject[typeName]._cocoonjs_proxy_type_data) {
                delete parentObject[typeName]._cocoonjs_proxy_type_data;
            }
        }
    };

    /**
    * Creates a new destination object instance and generates a id to reference it from the original environment.
    * @function newDestinationProxyObject
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type to be proxified and to generate an instance.
    * @return The id to be used from the original environment to identify the corresponding destination object instance.
    */
    extension.newDestinationProxyObject = function (typeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;

            var proxyObject = new parentObject[typeName]();
            // Also store some additional information in the proxy object
            proxyObject._cocoonjs_proxy_object_data = {};
            // Like the type name, that could be useful late ;)
            proxyObject._cocoonjs_proxy_object_data.typeName = typeName;
            // Caculate the id for the object. It will be returned to the origin environment so this object can be referenced later
            var proxyObjectId = parentObject[typeName]._cocoonjs_proxy_type_data.nextId;
            // Store the created object in the structure defined in the setup of proxification with an id associated to it
            parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[proxyObjectId] = proxyObject;
            // Also store the id inside the proxy object itself
            proxyObject._cocoonjs_proxy_object_data.id = proxyObjectId;
            // Calculate a new id for the next object.
            parentObject[typeName]._cocoonjs_proxy_type_data.nextId++;

            // Setup all the event handlers.
            for (var i = 0; i < parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames.length; i++) {
                (function (eventHandlerName) {
                    proxyObject[eventHandlerName] = function (event) {
                        var proxyObject = this; // event.target;
                        // var eventHandlerName = Cocoon.getKeyForValueInDictionary(proxyObject, this); // Avoid closures ;)
                        var jsCode = "Cocoon.App.callOriginProxyObjectEventHandler(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventHandlerName) + ");";
                        Cocoon.App.forwardAsync(jsCode);
                    };
                })(parentObject[typeName]._cocoonjs_proxy_type_data.eventHandlerNames[i]);
            }

            // Add the dictionary where the event listeners (callbacks) will be added.
            proxyObject._cocoonjs_proxy_object_data.eventListeners = {};

            return proxyObjectId;
        }
    };

    /**
    * Calls a function of a destination object idetified by it's typeName and id.
    * @function callDestinationProxyObjectFunction
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type of the proxy.
    * @param {number} id The id of the proxy object.
    * @param {string} functionName The name of the function to be called.
    * @return Whatever the function call returns.
    */
    extension.callDestinationProxyObjectFunction = function (typeName, id, functionName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            var argumentsArray = Array.prototype.slice.call(arguments);
            argumentsArray.splice(0, 3);
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            var result = proxyObject[functionName].apply(proxyObject, argumentsArray);
            return result;
        }
    };

    /**
    * Sets a value to the corresponding attributeName of a proxy object represented by it's typeName and id.
    * @function setDestinationProxyObjectAttribute
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type of the proxy.
    * @param {number} id The id of the proxy object.
    * @param {string} attributeName The name of the attribute to be set.
    * @param {unknown} attributeValue The value to be set to the attribute.
    */
    extension.setDestinationProxyObjectAttribute = function (typeName, id, attributeName, attributeValue) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            proxyObject[attributeName] = attributeValue;
        }
    };

    /**
    * Retrieves the value of the corresponding attributeName of a proxy object represented by it's typeName and id.
    * @function getDestinationProxyObjectAttribute
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type of the proxy.
    * @param {number} id The id of the proxy object.
    * @param {string} attributeName The name of the attribute to be retrieved.
    */
    extension.getDestinationProxyObjectAttribute = function (typeName, id, attributeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
            return proxyObject[attributeName];
        }
    };

    /**
    * Deletes a proxy object identifying it using it's typeName and id. Deleting a proxy object mainly means to remove the instance from the global structure
    * that hold all the instances.
    * @function deleteDestinationProxyObject
    * @memberof Cocoon.Proxify
    * @private
    * @param {string} typeName The name of the type of the proxy.
    * @param {number} id The id of the proxy object.
    */
    extension.deleteDestinationProxyObject = function (typeName, id) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            delete parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];
        }
    };

    /**
    * @function addDestinationProxyObjectEventListener
    * @memberof Cocoon.Proxify
    * @private
    */
    extension.addDestinationProxyObjectEventListener = function (typeName, id, eventTypeName) {
        if (Cocoon.App.nativeAvailable()) {
            var parentObject = window;
            // Look for the proxy object
            var proxyObject = parentObject[typeName]._cocoonjs_proxy_type_data.proxyObjects[id];

            var callback = function (event) {
                var proxyObject = this; // event.target;
                // var eventTypeName = Cocoon.getKeyForValueInDictionary(proxyObject._cocoonjs_proxy_object_data.eventListeners, this); // Avoid closures ;)
                // TODO: Is there a way to retrieve the callbackId without a closure?
                var jsCode = "Cocoon.Proxify.callOriginProxyObjectEventListeners(" + JSON.stringify(proxyObject._cocoonjs_proxy_object_data.typeName) + ", " + proxyObject._cocoonjs_proxy_object_data.id + ", " + JSON.stringify(eventTypeName) + ");";
                Cocoon.App.forwardAsync(jsCode);
            };

            proxyObject._cocoonjs_proxy_object_data.eventListeners[eventTypeName] = callback;

            // Finally add the event listener callback to the proxy object
            proxyObject.addEventListener(eventTypeName, callback);
        }
    };

    /**
    * Proxifies the XMLHttpRequest type for the environment where this call is made. After calling this function, all the new objects
    * of XMLHttpRequest that are instantiated, will be proxified objects that will make calls to the counterparts in the other environment (Cocoon <-> WebView viceversa).
    * IMPORTANT NOTE: Remember to take down the proxification once you are done or to delete proxy objects whenever they are not needed anymore or memory leaks may occur.
    * @function xhr
    * @memberof Cocoon.Proxify
    * @example
    * Cocoon.Proxify.xhr();
    */
    extension.xhr = function () {
        var ATTRIBUTE_NAMES =
            [
                "timeout",
                "withCredentials",
                "upload",
                "status",
                "statusText",
                "responseType",
                "response",
                "responseText",
                "responseXML",
                "readyState"
            ];
        var FUNCTION_NAMES =
            [
                "open",
                "setRequestHeader",
                "send",
                "abort",
                "getResponseHeader",
                "getAllResponseHeaders",
                "overrideMimeType"
            ];
        var EVENT_HANDLER_NAMES =
            [
                "onloadstart",
                "onprogress",
                "onabort",
                "onerror",
                "onload",
                "ontimeout",
                "onloadend",
                "onreadystatechange"
            ];
        Cocoon.Proxify.setupOriginProxyType("XMLHttpRequest", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };

    /**
    * Proxifies the Audio type for the environment where this call is made. After calling this function, all the new objects
    * of Audio that are instantiated, will be proxified objects that will make calls to the counterparts in the other environment (Cocoon <-> WebView viceversa).
    * IMPORTANT NOTE: Remember to take down the proxification once you are done or to delete proxy objects whenever they are not needed anymore or memory leaks may occur.
    * @function audio
    * @memberof Cocoon.Proxify
    * @example
    * Cocoon.Proxify.audio();
    */
    extension.audio = function () {
        var ATTRIBUTE_NAMES =
            [
                "src",
                "loop",
                "volume",
                "preload"
            ];
        var FUNCTION_NAMES =
            [
                "play",
                "pause",
                "load",
                "canPlayType"
            ];
        var EVENT_HANDLER_NAMES =
            [
                "onended",
                "oncanplay",
                "oncanplaythrough",
                "onerror"
            ];
        Cocoon.Proxify.setupOriginProxyType("Audio", ATTRIBUTE_NAMES, FUNCTION_NAMES, EVENT_HANDLER_NAMES);
    };


    /**
    * This function allows to forward console messages from the WebView to the CocoonJS
    * debug console. What it does is to change the console object for a new one
    * with all it's methods (log, error, info, debug and warn) forwarding their
    * messages to the Cocoon environment.
    * The original console object is stored in the Cocoon.originalConsole property.
    * @function console
    * @memberof Cocoon.Proxify
    * @example
    * Cocoon.Proxify.console();
    */
    extension.console = function () {
        if (!Cocoon.nativeAvailable()) return;

        if (typeof Cocoon.originalConsole === 'undefined') {
            Cocoon.originalConsole = window.console;
        }
        var functions = ["log", "error", "info", "debug", "warn"];

        var newConsole = {};
        for (var i = 0; i < functions.length; i++) {
            newConsole[functions[i]] = function (functionName) {
                return function (message) {
                    try {
                        var jsCode = "Proxified log: " + JSON.stringify(message);
                        Cocoon.originalConsole.log(jsCode);
                        ext.IDTK_APP.makeCallAsync("forward", jsCode);
                    } catch (e) {
                        console.log("Proxified log: " + e);
                    }
                };
            }(functions[i]);
        }
        if (!newConsole.assert) {
            newConsole.assert = function assert() {
                if (arguments.length > 0 && !arguments[0]) {
                    var str = 'Assertion failed: ' + (arguments.length > 1 ? arguments[1] : '');
                    newConsole.error(str);
                }
            };
        }
        window.console = newConsole;
    };

    /**
    * This function restores the original console object and removes the proxified console object.
    * @function deproxifyConsole
    * @memberof Cocoon.Proxify
    * @example
    * Cocoon.Proxify.deproxifyConsole();
    */
    extension.deproxifyConsole = function () {
        if (window.navigator.isCocoonJS || !Cocoon.nativeAvailable()) return;
        if (typeof Cocoon.originalConsole !== 'undefined') {
            window.console = Cocoon.originalConsole;
            Cocoon.originalConsole = undefined;
        }
    };

    return extension;

});
/**
* The "Cocoon.Touch" object holds some functions to handle the touch events in both surfaces ( Cocoon & WebView )
* @namespace Cocoon.Touch
*/
Cocoon.define("Cocoon.Touch", function (extension) {

    extension.addADivToDisableInput = function () {
        var div = document.createElement("div");
        div.id = "CocoonJSInputBlockingDiv";
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.position = "absolute";
        div.style.backgroundColor = 'transparent';
        div.style.border = "0px solid #000";
        div.style.zIndex = 999999999;
        document.body.appendChild(div);
    };

    extension.removeTheDivToEnableInput = function () {
        var div = document.getElementById("CocoonJSInputBlockingDiv");
        if (div) document.body.removeChild(div);
    };

    /**
     * Disables the touch events in the Cocoon environment.
     * @memberOf Cocoon.Touch
     * @function disable
     * @example
     * Cocoon.Touch.disable();
     */
    extension.disable = function () {
        if (Cocoon.nativeAvailable()) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "CocoonJSView");
        }
        else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.App.forwardEventsToCocoonJSEnabled = false;
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.disable();");
            }
        }
    };

    /**
     * Enables the touch events in the Cocoon environment.
     * @memberOf Cocoon.Touch
     * @function enable
     * @example
     * Cocoon.Touch.enable();
     */
    extension.enable = function () {
        if (Cocoon.nativeAvailable()) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "CocoonJSView");
        }
        else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.App.forwardEventsToCocoonJSEnabled = true;
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.enable();");
            }
        }
    };


    /**
     * Disables the touch events in the WebView environment.
     * @memberOf Cocoon.Touch
     * @function disableInWebView
     * @example
     * Cocoon.Touch.disableInWebView();
     */
    extension.disableInWebView = function () {
        if (Cocoon.nativeAvailable()) {
            window.ext.IDTK_APP.makeCall("disableTouchLayer", "WebView");
        }
        else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.Touch.addADivToDisableInput();
            }
            else {
                Cocoon.App.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.disableInWebView();");
            }
        }
    };

    /**
     * Enables the touch events in the WebView environment.
     * @memberOf Cocoon.Touch
     * @function enableInWebView
     * @example
     * Cocoon.Touch.enableInWebView();
     */
    extension.enableInWebView = function () {
        if (Cocoon.nativeAvailable()) {
            window.ext.IDTK_APP.makeCall("enableTouchLayer", "WebView");
        }
        else if (!navigator.isCocoonJS) {
            if (!Cocoon.App.EmulatedWebViewIFrame) {
                Cocoon.Touch.removeTheDivToEnableInput();
            }
            else {
                Cocoon.Touch.forwardAsync("Cocoon && Cocoon.Touch && Cocoon.Touch.enableInWebView();");
            }
        }
    };

    return extension;

});
/**
 * This namespace holds different utilities.
 * @namespace Cocoon.Utils
 */
Cocoon.define("Cocoon.Utils", function (extension) {
    "use strict";

    /**
    * Prints in the console the memory usage of the currently alive textures.
    * @function logMemoryInfo
    * @memberOf Cocoon.Utils
    * @example
    * Cocoon.Utils.logMemoryInfo();
    */
    extension.logMemoryInfo = function () {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "logMemoryInfo", arguments);
        }
    };

    /**
    * Sets the texture reduction options. The texture reduction is a process that allows big images to be reduced/scaled down when they are loaded.
    * Although the quality of the images may decrease, it can be very useful in low end devices or those with limited amount of memory.
    * The function sets the threshold on image size (width or height) that will be used in order to know if an image should be reduced or not.
    * It also allows to specify a list of strings to identify in which images file paths should be applied (when they meet the size threshold requirement) 
    * The developer will still think that the image is of the original size. Cocoon handles all of the internals to be able to show the image correctly.
    * IMPORTANT NOTE: This function should be called when the application is initialized before any image is set to be loaded for obvious reasons ;).
    * and in which sould be forbid (even if they meet the threshold requirement).
    * @function setTextureReduction
    * @memberOf Cocoon.Utils
    * @param {number} sizeThreshold This parameter specifies the minimun size (either width or height) that an image should have in order to be reduced.
    * @param {string|array} applyTo This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it will be reduced. This parameter can also be null.
    * @param {string|array} forbidFor This parameter can either be a string or an array of strings. It's purpose is to specify one (the string) or more (the array) substring(s) 
    * that will be compared against the file path of an image to be loaded in order to know if the reduction should be applied or not. If the image meets the
    * threshold size requirement and it's file path contains this string (or strings), it won't be reduced. This parameter should be used in order to mantain the 
    * quality of some images even they meet the size threshold requirement.
    * @example
    * Cocoon.Utils.textureReduction(64);
    */
    extension.textureReduction = function (sizeThreshold, applyTo, forbidFor) {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setDefaultTextureReducerThreshold", arguments);
        }
    };

    /**
    * Marks a audio file to be used as music by the system. Cocoon, internally, differentiates among music files and sound files.
    * Music files are usually bigger in size and longer in duration that sound files. There can only be just one music file 
    * playing at a specific given time. The developer can mark as many files as he/she wants to be treated as music. When the corresponding
    * HTML5 audio object is used, the system will automatically know how to treat the audio resource as music or as sound.
    * Note that it is not mandatory to use this function. The system automatically tries to identify if a file is suitable to be treated as music
    * or as sound by checking file size and duration thresholds. It is recommended, though, that the developer specifies him/herself what he/she considers
    * to be music.
    * @function markAsMusic
    * @param {string} filePath File path to be marked as music
    * @memberOf Cocoon.Utils
    * @example
    * Cocoon.Utils.markAsMusic("path/to/file.mp3");
    */
    extension.markAsMusic = function (audioFilePath) {
        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "addForceMusic", arguments);
        }
    };

    /**
     * Captures a image of the screen synchronously and saves it to a file. Sync mode allows to capture the screen in the middle of a frame rendering.
     * @function captureScreen
     * @memberof Cocoon.Utils
     * @param {string} fileName Desired file name and format (png or jpg). If no value is passed, "capture.png" value is used by default
     * @param {Cocoon.App.StorageType} storageType The developer can specify the storage where it is stored. If no value is passed, the {@link Cocoon.Utils.StorageType.TMP_STORAGE} value is used by default.
     * @param {Cocoon.Utils.CaptureType} captureType Optional value to choose capture type. See {@link Cocoon.Utils.CaptureType}.
     * - 0: Captures everything.
     * - 1: Only captures cocoon surface.
     * - 2: Only captures system views.
     * @param {boolean} saveToGallery Optional value to specify if the capture image should be stored in the device image gallery or not.
     * @throws exception if the image fails to be stored or there is another error.
     * @return The URL of the saved file.
     * @example
     * Cocoon.Utils.captureScreen("myScreenshot.png");
     */
    extension.captureScreen = function (fileName, storageType, captureType, saveToGallery) {
        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "captureScreen", arguments);
        }
    };

    /**
    * Captures a image of the screen asynchronously and saves it to a file.
    * Async mode captures a final frame as soon as possible.
    * @function captureScreenAsync
    * @memberof Cocoon.Utils
    * @param {string} fileName Desired file name and format (png or jpg). If no value is passed, "capture.png" value is used by default
    * @param {Cocoon.App.StorageType} storageType The developer can specify the storage where it is stored. If no value is passed, the {@see Cocoon.Utils.StorageType.TMP_STORAGE} value is used by default.
    * @param {Cocoon.Utils.CaptureType} captureType Optional value to choose capture type. See {@link Cocoon.Utils.CaptureType}.
    * - 0: Captures everything.
    * - 1: Only captures cocoon surface.
    * - 2: Only captures system views.
    * @param {boolean} saveToGallery Optional value to specify if the capture image should be stored in the device image gallery or not.
    * @param {function} callback Response callback, check the error property to monitor errors. Check the 'url' property to get the URL of the saved Image
    * @example
    * Cocoon.Utils.captureScreenAsync("myScreenshot.png", Cocoon.Utils.StorageType.TMP_STORAGE, false, Cocoon.Utils.CaptureType.EVERYTHING, function(url, error){
    * ...
    * });
    */
    extension.captureScreenAsync = function (fileName, storageType, captureType, saveToGallery, callback) {
        if (Cocoon.nativeAvailable()) {
            Cocoon.callNative("IDTK_APP", "captureScreen", arguments, true);
        }
    };

    /**
    * Activates or deactivates the antialas functionality from the Cocoon rendering.
    * @function setAntialias
    * @memberOf Cocoon.Utils
    * @param {boolean} enable A boolean value to enable (true) or disable (false) antialias.
    * @example
    * Cocoon.Utils.setAntialias(true);
    */
    extension.setAntialias = function (enable) {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setDefaultAntialias", arguments);
        }
    };

    /**
    * Activates or deactivates the webgl functionality from the Cocoon Canvas+ rendering.
    * @function setWebGLEnabled
    * @memberOf Cocoon.Utils
    * @param {boolean} enabled A boolean value to enable (true) or disable (false) webgl in Canvas+.
    * @example
    * Cocoon.Utils.setWebGLEnabled(true);
    */
    extension.setWebGLEnabled = function (enabled) {
        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "setWebGLEnabled", arguments, false);
        }
    };

    /**
    * Checks if WebGL is enabled in Canvas+.
    * @function isWebGLEnabled
    * @memberOf Cocoon.Utils
    * @example
    * var enabled = Cocoon.Utils.isWebGLEnabled();
    */
    extension.isWebGLEnabled = function () {
        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "isWebGLEnabled", arguments, false);
        }
    };

    /**
     * Enables NPOT (not power of two) textures in Canvas+. 
     * Canvas+ uses POT (power of two) textures by default. Enabling NPOT improves memory usage but may affect performance on old GPUs.
     * @function setNPOTEnabled
     * @memberof Cocoon.Utils
     * @param {boolean} enabled true to enable NPOT Textures
     * @example
     * Cocoon.Utils.setNPOTEnabled(true);
     */
    extension.setNPOTEnabled = function (enabled) {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return window.ext.IDTK_APP.makeCall("setNPOTEnabled", enabled);
        }
    };

    /**
     * Sets a max memory threshold in Canvas+ for canvas2D contexts.
     * If the maxMemory is enabled, Cocoon checks the total amount of texture sizes (images and canvases). 
     * When the memory size reaches the max memory threshold Cocoon disposes least recently used textures until the memory fits the threshold. 
     * It disposes textures used for JS Image objects (which can be reloaded later if needed).
     * It doesn't dispose canvas objects because they cannot be reconstructed if they are used again in a render operation.
     * @function setMaxMemory
     * @memberof Cocoon.Utils
     * @param {number} memoryInMBs max memory in megabytes
     * @example
     * Cocoon.Utils.setMaxMemory(75);
     */
    extension.setMaxMemory = function (memoryInMBs) {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return window.ext.IDTK_APP.makeCall("setMaxMemory", memoryInMBs);
        }
    };

    /**
    * 
    * @memberof Cocoon.Utils
    * @name Cocoon.Utils.CaptureType
    * @property {string} Cocoon.Utils.CaptureType - The base object
    * @property {string} Cocoon.Utils.CaptureType.EVERYTHING - Captures everything, both the Cocoon GL hardware accelerated surface and the system views (like the WebView).
    * @property {string} Cocoon.Utils.CaptureType.COCOONJS_GL_SURFACE - Captures just the Cocoon GL hardware accelerated surface.
    * @property {string} Cocoon.Utils.CaptureType.JUST_SYSTEM_VIEWS - Captures just the sustem views (like the webview)
    */
    extension.CaptureType = {
        EVERYTHING: 0,
        COCOONJS_GL_SURFACE: 1,
        JUST_SYSTEM_VIEWS: 2
    };

    /**
    * Queries if a file exists in the specified path and storage type. If none or unknown storage type is specified, the TEMPORARY_STORAGE is used as default.
    * @function existsPath
    * @memberof Cocoon.Utils
    * @param {string} path The relative path to look for inside the storage of the underlying system.
    * @param {Cocoon.App.StorageType} storageType The storage type where to look for the specified path inside the system.
    * @example
    * console.log(Cocoon.Utils.existsPath("file.txt"));
    */
    extension.existsPath = function (path, storageType) {
        if (Cocoon.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "existsPath", arguments);
        }
        return false;
    };

    /**
    * Setups the internal text texture cache size.
    * In order to improve the performance of fill and stroke operations, a text texture cache is used internally. Once a text is drawn
    * a texture is stored that matches that text and that text configuration. If the same text is called to 
    * be drawn, this cached texture would be used. 
    * This function allows to set the size of the cache. A value of 0 would mean that no cache
    * will be used. 
    * @function setTextCacheSize
    * @memberof Cocoon.Utils
    * @param size {number} The size of the text cache.
    * @example
    * Cocoon.Utils.setTextCacheSize(32);
    */
    extension.setTextCacheSize = function (size) {
        if (Cocoon.nativeAvailable() && navigator.isCocoonJS) {
            return Cocoon.callNative("IDTK_APP", "setTextCacheSize", arguments);
        }
    };

    return extension;

});
/*jshint loopfunc: true */
/**
* This namespace represents all functionalities available in Canvas+ internal WebView.
* @namespace Cocoon.WebView
* @example
* Cocoon.WebView.on("load",{
*   success : function(){
*       Cocoon.App.showTheWebView();
*   },
*   error : function(){
*        console.log("Cannot show the Webview for some reason :/");
*   }
* });
* Cocoon.App.loadInTheWebView("WV.html");
*/

Cocoon.define("Cocoon.WebView", function (extension) {

    if (typeof Cocoon === 'undefined' || Cocoon === null) return extension;
    if (typeof Cocoon.App === 'undefined' || Cocoon.App === null) return extension;
    if (navigator.isCocoonJS) return extension;

    /**
    * Shows a transparent WebView on top of the Cocoon hardware accelerated environment rendering context.
    * @function show
    * @memberof Cocoon.WebView
    * @param {number} [x] The horizontal position where to show the WebView.
    * @param {number} [y] The vertical position where to show the WebView.
    * @param {number} [width] The horitonzal size of the WebView.
    * @param {number} [height] the vertical size of the WebView.
    */
    extension.show = function (x, y, width, height) {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "show", arguments);
        }
        else {
            var div = window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewDiv');
            div.style.left = (x ? x : div.style.left) + 'px';
            div.style.top = (y ? y : div.style.top) + 'px';
            div.style.width = (width ? width / window.devicePixelRatio : window.parent.innerWidth) + 'px';
            div.style.height = (height ? height / window.devicePixelRatio : window.parent.innerHeight) + 'px';
            div.style.display = "block";
            var iframe = window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewIFrame');
            iframe.style.width = (width ? width / window.devicePixelRatio : window.parent.innerWidth) + 'px';
            iframe.style.height = (height ? height / window.devicePixelRatio : window.parent.innerHeight) + 'px';
        }
    };

    /**
    * Hides the transparent WebView on top of Canvas+.
    * @function hide
    * @memberof Cocoon.WebView
    */
    extension.hide = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.callNative("IDTK_APP", "hide", arguments);
        }
        else {
            window.parent.document.getElementById('CocoonJS_App_ForCocoonJS_WebViewDiv').style.display = "none";
        }
    };

    /**
    * Loads a resource in Canvas+ from the WebView. 
    * @function loadInCocoon
    * @memberof Cocoon.WebView
    * @param {string} path The path to the resource. It can be a remote URL or a path to a local file.
    * @param {callbacks} cb - An object containing two callbacks, { success : callback, error: callback }.
    * @param {Cocoon.App.StorageType} [storageType] An optional parameter to specify at which storage in the device the file path is stored. By default, APP_STORAGE is used.
    * <br/> success: This callback function allows listening to events called when Canvas+ load has completed successfully.
    * <br/> error: This callback function allows listening to events called when Canvas+ load fails.
    * @example
    * Cocoon.WebView.loadInCocoon("index.html", {
    *   success : function(){ ... },
    *   error : function(){ ... }
    * });
    */
    extension.loadInCocoon = function (path, callbacks, storageType) {
        if (Cocoon.App.nativeAvailable()) {
            var javaScriptCodeToForward = "ext.IDTK_APP.makeCall('loadPath'";
            if (typeof path !== 'undefined') {
                javaScriptCodeToForward += ", '" + path + "'";
                if (typeof storageType !== 'undefined') {
                    javaScriptCodeToForward += ", '" + storageType + "'";
                }
            }
            javaScriptCodeToForward += ");";

            return Cocoon.App.forwardAsync(javaScriptCodeToForward);
        }
        else {
            Cocoon.App.forwardAsync("Cocoon.App.load('" + path + "');");
        }
    };

    extension.reloadCocoonJS = function () {
        if (Cocoon.App.nativeAvailable()) {
            return Cocoon.App.forwardAsync("ext.IDTK_APP.makeCall('reload');");
        }
        else if (!navigator.isCocoonJS) {
            window.parent.location.reload();
        }
    };


    window.addEventListener("load", function () {


        // Only if we are completely outside Canvas+ (or Canvas+ internal webview),
        // setup event forwarding from the webview (iframe) to Cocoon.
        if (!Cocoon.App.nativeAvailable() && window.name == 'CocoonJS_App_ForCocoonJS_WebViewIFrame') {
            Cocoon.App.forwardEventsToCocoonJSEnabled = false;
            var EVENT_ATTRIBUTES = ['timeStamp', 'button', 'type', 'x', 'y', 'pageX', 'pageY', 'clientX', 'clientY', 'offsetX', 'offsetY'];
            var EVENTS = ["dblclick", "touchmove", "mousemove", "touchend", "touchcancel", "mouseup", "touchstart", "mousedown", "release", "dragleft", "dragright", "swipeleft", "swiperight"];
            var forwardEventToCocoonJS = function (eventName, event) {
                var eventData = {};
                for (var att in event) {
                    var i = EVENT_ATTRIBUTES.indexOf(att);
                    if (i >= 0) {
                        eventData[att] = event[att];
                    }
                }
                var jsCode = "Cocoon && Cocoon.App && Cocoon.App.forwardedEventFromTheWebView && Cocoon.App.forwardedEventFromTheWebView(" + JSON.stringify(eventName) + ", '" + JSON.stringify(eventData) + "');";
                Cocoon.App.forward(jsCode);
            };
            for (var i = 0; i < EVENTS.length; i++) {
                window.addEventListener(EVENTS[i], (function (eventName) {
                    return function (event) {
                        if (Cocoon.App.forwardEventsToCocoonJSEnabled) {
                            forwardEventToCocoonJS(eventName, event);
                        }
                    };
                })(EVENTS[i]));
            }
        }

    });

    extension.onLoadInCocoonJSSucceed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpageload");

    extension.onLoadInCocoonJSFailed = new Cocoon.EventHandler("IDTK_APP", "App", "forwardpagefail");

    return extension;
});
/** 
* This namespace holds the WebDialog widget, which essentially shows a Webview on top of the Cocoon layer.
* @namespace Cocoon.Widget
*/
Cocoon.define("Cocoon.Widget" , function(extension){
    "use strict";
    /**
    * Creates the WebDialog
    * @constructor WebDialog
    * @memberOf Cocoon.Widget
    * @example var dialog = new Cocoon.Widget.WebDialog();
    */
    extension.WebDialog = function() {
        
        if (Cocoon.App.nativeAvailable()) {
            this.webDialogID = window.ext.IDTK_APP.makeCall("createWebDialog");
        }
        else {
            var iframe = document.createElement("iframe");
            iframe.id = "CocoonJSWebDialogIFrame";
            iframe.name = "CocoonJSWebDialogIFrame";
            iframe.style.cssText = "position:fixed;left:0;top:0;bottom:0;right:0; width:100%; height:100%;margin:0;padding:0;";
            var me = this;
            iframe.onload = function(){
                me.iframeloaded = true;
                var js = "Cocoon = {}; Cocoon.Widget = {}; Cocoon.Widget.WebDialog = {}; Cocoon.Widget.WebDialog.close = function()" +
                    "{" +
                    "   window.parent.CocoonJSCloseWebDialog();" +
                    "};";
                me.evalIframe(js);
                for (var i = 0; i < me.pendingEvals.length; ++i) {
                    me.evalIframe(me.pendingEvals[i]);
                }
                me.pendingEvals = [];
            };
            iframe.onerror = function(){
                me.close();
            };
            this.iframe = iframe;
            this.pendingEvals = [];

            window.CocoonJSCloseWebDialog = function() {
               me.close();
            };
        }

    };

    extension.WebDialog.prototype = {
        /**
        * Shows the dialog.
        * @function show
        * @memberOf Cocoon.Widget.WebDialog
        * @param {string} url The url to be opened on the Web Dialog.
        * @param {function} closeCallback The callback that will be fired when the dialog is closed.
        * @example 
        * var dialog = new Cocoon.Widget.WebDialog();
        * dialog.show("http://www.ludei.com", function(){
        *   console.log("The dialog has been closed!");
        * });
        */
        show: function(url, callback) {
            this.closeCallback = function() {
                Cocoon.Touch.enable();
                if (callback)
                    callback();
            };
            if (Cocoon.App.nativeAvailable()) {
                Cocoon.Touch.disable();
                return window.ext.IDTK_APP.makeCallAsync("showWebDialog", this.webDialogID, url, this.closeCallback);
            }
            else {
                this.iframe.src = url;
                document.body.appendChild(this.iframe);
            }

        },
        
        /**
        * Closes the dialog.
        * @function close
        * @memberOf Cocoon.Widget.WebDialog
        * @example 
        * var dialog = new Cocoon.Widget.WebDialog();
        * dialog.show("http://www.ludei.com");
        * //This dialog will close after 15 seconds.
        * setTimeout(function(){
        *   dialog.close();
        * }, 15000);
        */
        close: function() {
            if (Cocoon.App.nativeAvailable()) {
                return window.ext.IDTK_APP.makeCallAsync("closeWebDialog", this.webDialogID);
            }
            else {
                if (this.iframe.parentNode) {
                    this.iframe.parentNode.removeChild(this.iframe);
                }
            }
            if (this.closeCallback)
                this.closeCallback();
        },
        evalIframe: function(js) {
            /*jshint evil:true */
            window.frames.CocoonJSWebDialogIFrame.eval(js);
        },

        /**
        * Evaluates a javascript string in the WebDialog environment.
        * @function eval
        * @memberOf Cocoon.Widget.WebDialog
        * @example 
        * var dialog = new Cocoon.Widget.WebDialog();
        * dialog.eval("alert('Michael Jackson is the king of pop')");
        */
        eval: function(js) {
            if (Cocoon.App.nativeAvailable()) {
                return window.ext.IDTK_APP.makeCallAsync("evalWebDialog", this.webDialogID, js);
            }
            else {
                if (this.iframeloaded)
                    this.evalIframe(js);
                else
                    this.pendingEvals.push(js);
            }
        }

    };

    return extension;

});