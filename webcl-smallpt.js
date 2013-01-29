/**
 * @author Matias Piispanen
 */
var M_PI = 3.14159265358979323846;
var maxint = 2147483647;

var selected = 0;
var selectedPlatform;
var canvas;
var canvasContext;
var cl;
var clQueue;
var clSrc;
var clProgram;
var clKernel;
var wgSize;

var sphereCount;
var pixelCount;
var currentSample = 0;
var testarray;
var console;
var spheres = [];
var currentSphere = 0;
var camera;
var scene;

var sphereBuffer;
var cameraBuffer;
var pixelBuffer;
var colorBuffer;
var seedBuffer;

var pixels;
var canvasContent;
var pixel8View;
var pBuffer;

var clTime = 0;
var jsTime = 0;
var clMemTime = 0;
var elapsedTime = 0;
var prevTime = 0;

var running = true;

requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;  
      
var start = window.mozAnimationStartTime;  // Only supported in FF. Other browsers can use something like Date.now(). 

function webclsmallpt() {
	console = document.getElementById("console");
	canvas = document.getElementById("canvas");
    canvasContext = canvas.getContext("2d");
    
    scene = new Scene();
    spheres = scene.getBuffer();
	camera = new Camera();var clUtil;

	
	camera.orig.set([50.0, 45.0, 205.6]);
	camera.target.set([50.0, 45.0 - 0.042612, 204.6]);
	
	updateCamera();
    
    setupWebCL();
	canvasContent = canvasContext.createImageData(canvas.width, canvas.height);
	
	updateRendering();
	running = true;
	prevTime = Date.now();
	requestAnimationFrame(step, canvas);  
} 
      
function step(timestamp) {  
	if(running == true) {
		jsTime = Date.now() - prevTime - clTime - clMemTime - elapsedTime;
		prevTime = Date.now();
		console.innerHTML = "WebCL (ms): " + clTime + "<br>WebCL memory transfer (ms): " + clMemTime + "<br>JS (ms): " + jsTime;
		clTime = 0;
		jsTime = 0;
		clMemTime = 0;
		updateRendering();
		requestAnimationFrame(step, canvas);  
	}
}  

function updateCamera() {
	vec3.subtract(camera.target, camera.orig, camera.dir);
	vec3.normalize(camera.dir);

	//NOTE: changed up direction from 1.0 to -1.0
	var up = vec3.create([0.0, -1.0, 0.0]);
	var fov = (M_PI / 180.0) * 45.0;
	vec3.cross(camera.dir, up, camera.x);
	vec3.normalize(camera.x);
	vec3.scale(camera.x, canvas.width * fov / canvas.height, camera.x);
	
	vec3.cross(camera.x, camera.dir, camera.y);
	vec3.normalize(camera.y);
	vec3.scale(camera.y, fov, camera.y);
}

function reInitScene() {
	currentSample = 0;
	
	var bufSize = 11 * 4 * sphereCount;
	clQueue.enqueueWriteBuffer(sphereBuffer, true, 0, bufSize, scene.getBuffer(), []);
}

function reInit() {
	currentSample = 0;
	
	updateCamera();
	
	var bufSize = 15 * 4;
	clQueue.enqueueWriteBuffer(cameraBuffer, true, 0, bufSize, camera.getBuffer(), []);
}

function drawPixels() {
	pixel8View = new Uint8ClampedArray(pBuffer);
	canvasContent.data.set(pixel8View);
	canvasContext.putImageData(canvasContent, 0, 0);
}

function reset() {
	reInit();
}

function stop() {
	if(running) {
		running = false;
		document.getElementById("stop").innerHTML = "Start";
	}
	else {
		running = true;
		requestAnimationFrame(step, canvas);  
		document.getElementById("stop").innerHTML = "Stop";
	}
}

function resolutionChanged(resolution) {
	running = false;
	
	if(resolution == 0) {
		canvas.width = 320;
		canvas.height = 240;
	}
	else if(resolution == 1) {
		canvas.width = 640;
		canvas.height = 480;
	}
	else if(resolution == 2) {
		canvas.width = 800;
		canvas.height = 600;
	}
	
	freeBuffers();
	webclsmallpt();
	reInit();
}

function keyFunc(event) {
	var key = event.keyCode;
	var MOVE_STEP = 10.0;
	var ROTATE_STEP = 2.0 * M_PI / 180.0;
	
	var up = 38;
	var down = 40;
	var left = 39;
	var right = 37;
	
	var two = 50;
	var three = 51;
	var four = 52;
	var five = 53;
	var six = 54;
	var seven = 55;
	var eight = 56;
	var nine = 57;
	
	var plus = 107;
	var minus = 109;
	
	var w = 87;
	var a = 65;
	var s = 83;
	var d = 68;
	var r = 82;
	var f = 70;
	
	var pgup = 33;
	var pgdown = 34;
	
	switch(key) {
		case up:
			var t = vec3.create(camera.target);
			vec3.subtract(t, camera.orig, t);
			t[1] = t[1] * Math.cos(-ROTATE_STEP) + t[2] * Math.sin(-ROTATE_STEP);
			t[2] = -t[1] * Math.sin(-ROTATE_STEP) + t[2] * Math.cos(-ROTATE_STEP);
			vec3.add(t, camera.orig, t);
			camera.target = t;
			reInit();
			break;
		case down:
			var t = vec3.create(camera.target);
			vec3.subtract(t, camera.orig, t);
			t[1] = t[1] * Math.cos(ROTATE_STEP) + t[2] * Math.sin(ROTATE_STEP);
			t[2] = -t[1] * Math.sin(ROTATE_STEP) + t[2] * Math.cos(ROTATE_STEP);
			vec3.add(t, camera.orig, t);
			camera.target = t;
			reInit();
			break;
		case left: 
			var t = vec3.create(camera.target);
			vec3.subtract(t, camera.orig, t);
			t[0] = t[0] * Math.cos(-ROTATE_STEP) - t[2] * Math.sin(-ROTATE_STEP);
			t[2] = t[0] * Math.sin(-ROTATE_STEP) + t[2] * Math.cos(-ROTATE_STEP);
			vec3.add(t, camera.orig, t);
			camera.target = t;
			reInit();
			break;
		case right: 
			var t = vec3.create(camera.target);
			vec3.subtract(t, camera.orig, t);
			t[0] = t[0] * Math.cos(ROTATE_STEP) - t[2] * Math.sin(ROTATE_STEP);
			t[2] = t[0] * Math.sin(ROTATE_STEP) + t[2] * Math.cos(ROTATE_STEP);
			vec3.add(t, camera.orig, t);
			camera.target = t;
			reInit();
			break;
		case pgup:
			camera.target[1] += MOVE_STEP;
			reInit();
			break;
		case pgdown:
			camera.target[1] -= MOVE_STEP;
			reInit();
			break;
		case w:
			var dir = vec3.create(camera.dir);
			vec3.scale(dir, MOVE_STEP);
			vec3.add(camera.orig, dir, camera.orig);
			vec3.add(camera.target, dir, camera.target);
			reInit();
			break;
		case a:
			var dir = vec3.create(camera.x);
			vec3.normalize(dir);
			vec3.scale(dir, -MOVE_STEP);
			vec3.add(camera.orig, dir, camera.orig);
			vec3.add(camera.target, dir, camera.target);
			reInit();
			break;
		case s:
			var dir = vec3.create(camera.dir);
			vec3.scale(dir, -MOVE_STEP);
			vec3.add(camera.orig, dir, camera.orig);
			vec3.add(camera.target, dir, camera.target);
			reInit();
			break;;
		case d:
			var dir = vec3.create(camera.x);
			vec3.normalize(dir);
			vec3.scale(dir, MOVE_STEP);
			vec3.add(camera.orig, dir, camera.orig);
			vec3.add(camera.target, dir, camera.target);
			reInit();
			break;
		case r:
			camera.orig[1] += MOVE_STEP;
			camera.target[1] += MOVE_STEP;
			reInit();
			break;
		case f:
			camera.orig[1] -= MOVE_STEP;
			camera.target[1] -= MOVE_STEP;
			reInit();
			break;
		case four:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[0] -= 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case six:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[0] += 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case eight:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[2] -= 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case two:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[2] += 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case nine:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[1] += 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case three:
			var sArray = scene.getSpheres();
			sArray[currentSphere].p[1] -= 0.5 * MOVE_STEP;
			reInitScene(); 
			break;
		case plus:
			currentSphere = (currentSphere + 1) % sphereCount;
			reInitScene();
			break;
		case minus:
			currentSphere = (currentSphere + (sphereCount - 1)) % sphereCount;
			reInitScene();
			break;
		default:
			break;
	}
}

function deviceChanged(device) {
	running = false;
	currentSample = 0;
	freeBuffers();
	
	selected = device;
	
	webclsmallpt();
}

function freeBuffers() {
	sphereBuffer.releaseCLResources();
	cameraBuffer.releaseCLResources();
	pixelBuffer.releaseCLResources();
	colorBuffer.releaseCLResources();
	seedBuffer.releaseCLResources();
	
	clQueue.releaseCLResources();
	clProgram.releaseCLResources();
	clKernel.releaseCLResources();
	cl.releaseCLResources();
}

function allocateBuffers() {
	// "sizeof(Sphere)"
	sphereCount = scene.getSphereCount();
	var bufSize = 11 * 4 * sphereCount;
	sphereBuffer = cl.createBuffer(WebCL.CL_MEM_READ_ONLY, bufSize);
	
	clQueue.enqueueWriteBuffer(sphereBuffer, true, 0, bufSize, spheres, []);
	
	//"sizeof(Camera)"
	bufSize = 15 * 4;
	cameraBuffer = cl.createBuffer(WebCL.CL_MEM_READ_ONLY, bufSize);
	
	clQueue.enqueueWriteBuffer(cameraBuffer, true, 0, bufSize, camera.getBuffer(), []);
	
	pixelCount = canvas.width * canvas.height;
	pBuffer = new ArrayBuffer(4 * pixelCount);
	pixelArray = new Int32Array(pBuffer);
	pixel8View = new Uint8ClampedArray(pixelCount * 4);
	
	for(var i = 0; i < pixelCount * 4; i++) {
		pixel8View[i] = i % 255;
	}
		
	var seeds = new Uint32Array(pixelCount * 2);
	
	for(var i = 0; i < pixelCount * 2; i++) {
		seeds[i] = Math.random() * maxint;
		
		if(seeds[i] < 2) {
			seeds[i] = 2;
		}
	}
	
	bufSize = 3 * 4 * pixelCount;
	colorBuffer = cl.createBuffer(WebCL.CL_MEM_READ_WRITE, bufSize);
	
	bufSize = 4 * pixelCount;
	pixelBuffer = cl.createBuffer(WebCL.CL_MEM_WRITE_ONLY, bufSize);
	
	bufSize = 4 * pixelCount * 2;
	seedBuffer = cl.createBuffer(WebCL.CL_MEM_READ_WRITE, bufSize);
	
	clQueue.enqueueWriteBuffer(seedBuffer, true, 0, bufSize, seeds, []);
}

function setupWebCL() {

	if(window.WebCL == undefined) {
		alert("Your browser doesn't support WebCL");
		return false;
	}

	var platforms = [];
	var devices = [];

	try {
		platforms = WebCL.getPlatformIDs();

		var devicelist = "";

		for(var i in platforms) {
			devices = devices.concat(platforms[i].getDeviceIDs(WebCL.CL_DEVICE_TYPE_ALL));
		}

		for(var i in devices) {
			devicelist += "<option value=" + i + ">" + devices[i].getDeviceInfo(WebCL.CL_DEVICE_NAME) + "</option>\n";
		}

		var deviceselect = document.getElementById("devices");
		deviceselect.innerHTML = devicelist;
		deviceselect.selectedIndex = selected;
		selectedPlatform = platforms[selected];
		cl = WebCL.createContextFromType([WebCL.CL_CONTEXT_PLATFORM, selectedPlatform], WebCL.CL_DEVICE_TYPE_DEFAULT);
		devices = cl.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
		clQueue = cl.createCommandQueue(devices[0], 0);

		allocateBuffers();
	} catch(err) {
		alert("Error initializing WebCL");
	}

	try {
		// Kernel init
		clSrc = document.getElementById("clSmallptGPU").text;
		clProgram = cl.createProgramWithSource(clSrc);

		clProgram.buildProgram([devices[0]], "-cl-fast-relaxed-math");
	} catch(e) {
		alert("Failed to build WebCL program. Error " + clProgram.getProgramBuildInfo(devices[0], WebCL.CL_PROGRAM_BUILD_STATUS) + ":  " + clProgram.getProgramBuildInfo(devices[selected], WebCL.CL_PROGRAM_BUILD_LOG));
	}

	
	clKernel = clProgram.createKernel("RadianceGPU");
	
	wgSize = clKernel.getKernelWorkGroupInfo(devices[0], WebCL.CL_KERNEL_WORK_GROUP_SIZE);
}

function executeKernel() {
	var globalThreads = canvas.width * canvas.height;
	
	if(globalThreads % wgSize != 0) {
		globalThreads = (globalThreads / wgSize + 1) * wgSize;
	}
	
	var localThreads = wgSize;
	
	clKernel.setKernelArg(0, colorBuffer);
	clKernel.setKernelArg(1, seedBuffer);
	clKernel.setKernelArg(2, sphereBuffer);
	clKernel.setKernelArg(3, cameraBuffer);
	clKernel.setKernelArg(4, sphereCount, WebCL.types.UINT);
	clKernel.setKernelArg(5, canvas.width, WebCL.types.INT);
	clKernel.setKernelArg(6, canvas.height, WebCL.types.INT);
	clKernel.setKernelArg(7, currentSample, WebCL.types.INT);
	clKernel.setKernelArg(8, pixelBuffer);
	
	try {
		var start = Date.now();
		clQueue.enqueueNDRangeKernel(clKernel, 1, [], [globalThreads], [localThreads], [])
		clQueue.finish();
		clTime += Date.now() - start;
	}
	catch(e) {
		console.innerHTML = e;
	}
}

function updateRendering() {
	var startTime = Date.now();
	var startSampleCount = currentSample;
	
	if(currentSample < 20) {
		executeKernel();
		currentSample += 1;
	}
	else {
		var k = Math.min(currentSample - 20, 100) / 100.0;
		var thresholdTime = 0.5 * k;
		
		for(;;) {
			executeKernel();
			clQueue.finish();
			currentSample += 1;
			
			var elapsedTime = Date.now() - startTime;
			if(elapsedTime > thresholdTime) {
				break;
			}
		}
	}
	
	var bufSize = 4 * pixelCount;
	
	var start = Date.now();
	clQueue.enqueueReadBuffer(pixelBuffer, true, 0, bufSize, pixelArray, []);
	clMemTime += Date.now() - start;
	
	elapsedTime = Date.now() - startTime;
	var samples = currentSample - startSampleCount;
	var sampleSec = samples * canvas.height * canvas.width / elapsedTime;
	
	console.innerHTML += "<br>Rendering time " + elapsedTime + " ms (pass " + currentSample + ")<br>Sample/sec " + sampleSec.toFixed(2) + "K\n";
	
	drawPixels();
} 

function reinitScene() {
	
}

function reinit(reallocBuffers) {
	
}
