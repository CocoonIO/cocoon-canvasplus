Cocoon Canvas+
=====================

Cocoon Canvas+ are multiplatform Javascript utilities that work in Canvas+. They are included in Canvas+ core, so it is not required to install anything else at the cloud. The required files, if so, will be injected automatically in your project. Only available in [Cocoon.io](http://cocoon.io/) projects.

## deviceready event

The [deviceready event](https://cordova.apache.org/docs/en/4.0.0/cordova_events_events.md.html#deviceready) fires when Cordova is fully loaded.

Unlike old CocoonJS plugins, Cocoon Canvas+ plugins need to wait for this event to start working.

### Example
```
	document.addEventListener("deviceready", onDeviceReady, false);

	function onDeviceReady() {
	    // Cocoon Canvas+ code here
	}
```
You can learn more about Cordova events [here](https://cordova.apache.org/docs/en/4.0.0/cordova_events_events.md.html)

## Canvas+ internal Webview

Canvas+ allows accessing a full DOM environment via Webview. Thus, there are two environments that live together: Canvas+ and WebView. Although both are two different JavaScript environments, Cocoon allows to render a transparent Webview on top of the Canvas+ OpenGL ES rendering context and it also provides a bidirectional communication channel between them. In this way, the final visual result seems to integrate both environments seamlessly.

However, as Cordova only injects automatically the required clobbers in the main webview engine, it is neccesary to add manually the following files to the content that will be sent and displayed in Canvas+ internal Webview: 

* <a href="https://github.com/ludei/cocoon-common/blob/master/src/js/cocoon.js" target="_blank">cocoon.js</a>
* <a href="https://github.com/CocoonIO/cocoon-canvasplus/blob/master/dist/js/cocoon_canvasplus.js" target="_blank">cocoon_canvasplus.js</a>

## Documentation 

* See [Cocoon Canvas+](http://cocoonio.github.io/cocoon-canvasplus/dist/doc/js/index.html) full documentation.

# License

Mozilla Public License, version 2.0

Copyright (c) 2015 Ludei 

See [`MPL 2.0 License`](LICENSE)
