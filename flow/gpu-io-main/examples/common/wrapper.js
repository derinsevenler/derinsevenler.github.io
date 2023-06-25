'use strict';
{
	const {
		GLSL1,
		GLSL3,
		WEBGL1,
		WEBGL2,
		isWebGL2Supported,
	} = GPUIO;

	const webGLSettings = {
		webGLVersion: isWebGL2Supported() ? 'WebGL 2' : 'WebGL 1',
		GLSLVersion: isWebGL2Supported() ? 'GLSL 3' : 'GLSL 1',
	};
	const availableWebGLVersions = { webgl1: 'WebGL 1' };
	const availableGLSLVersions = { glsl1: 'GLSL 1' };
	if (isWebGL2Supported()) {
		availableWebGLVersions.webgl2 = 'WebGL 2';
		availableGLSLVersions.glsl3 = 'GLSL 3';
	}
	
	// Global variables to get from example app.
	let loop, dispose, composer, canvas;
	// Other global ui variables.
	// let title = webGLSettings.webGLVersion;
	let useGLSL3Toggle;

	function reloadExampleWithNewParams() {
		if (useGLSL3Toggle) {
			useGLSL3Toggle.dispose();
			useGLSL3Toggle = undefined;
		}
		if (canvas) {
			canvas.addEventListener('gesturestart', disableZoom);
			canvas.addEventListener('gesturechange', disableZoom); 
			canvas.addEventListener('gestureend', disableZoom);
		}
		if (webGLSettings.webGLVersion === 'WebGL 1') webGLSettings.GLSLVersion = 'GLSL 1';
		if (dispose) dispose();
		({ loop, composer, dispose, canvas } = main({
			contextID: webGLSettings.webGLVersion === 'WebGL 2' ? WEBGL2 : WEBGL1,
			glslVersion: webGLSettings.GLSLVersion === 'GLSL 3' ? GLSL3 : GLSL1,
		}));
		canvas.addEventListener('gesturestart', disableZoom);
		canvas.addEventListener('gesturechange', disableZoom); 
		canvas.addEventListener('gestureend', disableZoom);

	}

	// Load example app.
	reloadExampleWithNewParams();

	// Disable gestures.
	function disableZoom(e) {
		e.preventDefault();
		const scale = 'scale(1)';
		// @ts-ignore
		document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
		// @ts-ignore
		document.body.style.msTransform =   scale;       // IE 9
		document.body.style.transform = scale;
	}

	function outerLoop() {
		// Update fps counter.
		const { fps, numTicks } = composer.tick();
		if (numTicks % 10 === 0) {
			// settings.title = `${title} (${fps.toFixed(1)} FPS)`;
		}
		window.requestAnimationFrame(outerLoop);
		// Run example loop.
		if (loop) loop();
	}
	// Start loop.
	outerLoop();
}