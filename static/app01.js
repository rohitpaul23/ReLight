// Import the necessary Three.js components
import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';

// Parse URL parameters for image paths
const urlParams = new URLSearchParams(window.location.search);
const imagePath = urlParams.get('image') || '/static/images/img01.png'; // Set default;
const normalMapPath = urlParams.get('normalMap') || '/static/images/norm01.png';
const depthMapPath = urlParams.get('depthMap') || '/static/images/depth01.png';

// Global variables for texture size, camera, and render target
let textureWidth, textureHeight;
let renderTarget, cameraOrtho;

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xaaaaaa);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
//document.body.appendChild(renderer.domElement);

const canvasContainer = document.querySelector('.canvas-container');
canvasContainer.appendChild(renderer.domElement);  // Append Three.js canvas to the container

/*
const geometry = new THREE.PlaneGeometry(5, 5); // Example geometry
const material = new THREE.MeshBasicMaterial({ map: null }); // Start with no texture
const yourMesh = new THREE.Mesh(geometry, material);
scene.add(yourMesh);
*/


let isReadyForScreenshot = false;
let light, spotLightHelper, material, plane


function setupSceneAndCapture() {
    let intensity = Math.random() * 300 + 300;
    
    // Array of natural light colors
    let naturalLightColors = [0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFCF1DE, 0xD7F3FC];

    // Select a random color from the array
    let randomColor = naturalLightColors[Math.floor(Math.random() * naturalLightColors.length)];

    // Add a spot light source to see the material's effect
    light = new THREE.SpotLight(randomColor, intensity, 100, Math.PI / 4, 1, 2);
    
    // Generate a random boolean value to decide which range to use for the x position
    let useNegativeRange = Math.random() < 0.5;

    let rangeModifier = intensity / 300; 
    
    // Generate random x and y positions
    let minRange = 3 * rangeModifier;
    let maxRange = 6 * rangeModifier;
    let randomX = useNegativeRange ? Math.random() * (minRange - maxRange) - minRange : Math.random() * (maxRange - minRange) + minRange;
    // Generate random x and y positions
    //let randomX = useNegativeRange ? Math.random() * (1 - 4) - 1: Math.random() * (4 - 1) + 1;

    // Generate random x and y positions within the range of 2 to 7
    //let randomX = Math.random() * (7 - 2) + 2;
    let randomY = Math.random() * (5 - 1);
    light.position.set(randomX, randomY, 8);
    
    light.castShadow = true;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.fov = 30;
    light.shadow.bias = -0.0001;
    scene.add(light);
    
    // Helper to visualize the spot light's position and direction
    //spotLightHelper = new THREE.SpotLightHelper(light);
    //scene.add(spotLightHelper);


    //Newly Added
    //const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
    //scene.add(shadowCameraHelper);


    // Add a ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const geometry = new THREE.PlaneGeometry(5, 7, 128, 128);
    const loader = new THREE.TextureLoader();

    Promise.all([
        loader.loadAsync(imagePath),
        loader.loadAsync(normalMapPath),
        loader.loadAsync(depthMapPath),
    ])
    .then(([texture, normalMap, displacementMap]) => {
        // Set texture size
        textureWidth = texture.image.width;
        textureHeight = texture.image.height;
        
        // Resize canvas based on the texture's aspect ratio
        //resizeCanvas(textureWidth, textureHeight);

        // Initialize orthographic camera and render target with the texture's dimensions
        //const aspectRatio = textureWidth / textureHeight;
        // Create an orthographic camera that exactly covers the plane's size
        const planeWidth = geometry.parameters.width;
        const planeHeight = geometry.parameters.height;
        
        cameraOrtho = new THREE.OrthographicCamera(-planeWidth / 2, planeWidth / 2, planeHeight / 2, -planeHeight / 2, 0.1, 1000);
        cameraOrtho.position.z = 5;
        cameraOrtho.lookAt(new THREE.Vector3(0, 0, 0));

        renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight);

        // Create Material
        material = new THREE.MeshStandardMaterial({
            map: texture,
            //normalMap: normalMap,
            //displacementMap: displacementMap,
            displacementScale: 0.001,
            metalness: 0.7,
            roughness: 0.7,
            transparent: true,
            alphaTest: 0.05,
        });
        
        material.premultipliedAlpha = false;
        
        // Create the plane mesh with the material

        plane = new THREE.Mesh(geometry, material);
        //const plane = new THREE.Mesh(geometry, material);
        plane.castShadow = true;
        plane.receiveShadow = true;
        scene.add(plane);

        //Added
        light.target = plane;

        isReadyForScreenshot = true;
        animate();
        
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
}



// Object to hold uploaded textures
const uploadedTextures = {
    main: null,
    normal: null,
    depth: null,
};

// Handle file uploads
function handleFileUpload(event, type) {
    const file = event.target.files[0]; // Get the first file from the input

    if (!file) {
        console.error(`No ${type} file selected.`);
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const url = e.target.result; // Get the result of the FileReader

        // Load the texture based on the type
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, function(texture) {
            // Store the uploaded texture
            uploadedTextures[type] = texture;

            // Inform the user that the texture has been uploaded
            console.log(`${type} texture uploaded successfully.`);
        }, undefined, function(err) {
            console.error(`An error occurred loading the ${type} texture.`, err);
        });
    };

    reader.readAsDataURL(file);
}

// Clear uploaded images
function clearUploadedImages() {
    // Reset the uploadedTextures object
    uploadedTextures.main = null;
    uploadedTextures.normal = null;
    uploadedTextures.depth = null;

    // Clear the file input fields
    document.getElementById('imageUpload').value = '';
    document.getElementById('normalUpload').value = '';
    document.getElementById('depthUpload').value = '';
}

// Clear Button Handler
function handleClearButton() {
    if (plane) {
        // Clear the material maps
        plane.material.map = null; // Clear the main texture
        plane.material.normalMap = null; // Clear the normal map
        plane.material.displacementMap = null; // Clear the displacement map

        // Reset the material properties
        plane.material.needsUpdate = true; // Inform Three.js to update the material

        // Clear uploaded images from the inputs
        clearUploadedImages();
    } else {
        console.error('Mesh not defined. Make sure to initialize yourMesh.');
    }
}

// Update Button Handler
function handleUpdateButton() {
    if (plane) {
        // Check and update the main texture
        if (uploadedTextures.main) {
            plane.material.map = uploadedTextures.main;
        }

        // Check and update the normal map
        if (uploadedTextures.normal) {
            plane.material.normalMap = uploadedTextures.normal;
        }

        // Check and update the depth map
        if (uploadedTextures.depth) {
            plane.material.displacementMap = uploadedTextures.depth;
            plane.material.displacementScale = 0.1; // Set a scale for displacement
        }

        plane.material.needsUpdate = true; // Inform Three.js to update the material

        // Clear uploaded images
        clearUploadedImages();

    } else {
        console.error('Mesh not defined. Make sure to initialize yourMesh.');
    }
}

// Attach event listeners
document.getElementById('imageUpload').addEventListener('change', (event) => handleFileUpload(event, 'main'));
document.getElementById('normalUpload').addEventListener('change', (event) => handleFileUpload(event, 'normal'));
document.getElementById('depthUpload').addEventListener('change', (event) => handleFileUpload(event, 'depth'));
document.getElementById('update').addEventListener('click', handleUpdateButton);

// Add event listener for the Clear button
document.getElementById('clear').addEventListener('click', handleClearButton);

function captureScreenshot() {
    // Ensure the renderer is set to render to our renderTarget
    renderer.setRenderTarget(renderTarget);
    // Render the scene using the orthographic camera
    renderer.render(scene, cameraOrtho);
    
    // Create a canvas element to extract the image
    const screenshotCanvas = document.createElement('canvas');
    screenshotCanvas.width = textureWidth;
    screenshotCanvas.height = textureHeight;
    const context = screenshotCanvas.getContext('2d');
    
    // Use the WebGL renderer to extract the texture data
    const pixels = new Uint8Array(textureWidth * textureHeight * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, textureWidth, textureHeight, pixels);
    renderer.setRenderTarget(null);
    
    // Create ImageData and put it into the canvas
    const imageData = new ImageData(new Uint8ClampedArray(pixels), textureWidth, textureHeight);
    //context.putImageData(imageData, 0, 0);
    
    // Flip the image data by drawing it inverted on a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = textureWidth;
    tempCanvas.height = textureHeight;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.putImageData(imageData, 0, 0);

    // Now draw the temporary canvas inverted onto the final screenshotCanvas
    context.translate(0, textureHeight);
    context.scale(1, -1);
    context.drawImage(tempCanvas, 0, 0);
    
    // Convert canvas to Data URL
    const dataURL = screenshotCanvas.toDataURL('image/png');
    /*
    // Convert canvas to Data URL and download
    const link = document.createElement('a');s
    link.href = dataURL;
    link.download = 'screenshot.png';
    link.click();
    */
    sendScreenshotToServer(dataURL)

}



function updateLight() {
    // Get values from input fields for light and shadow properties
    const lightX = parseFloat(document.getElementById('lightX').value) || 0;
    const lightY = parseFloat(document.getElementById('lightY').value) || 0;
    const lightZ = parseFloat(document.getElementById('lightZ').value) || 0;
    const lightIntensity = parseFloat(document.getElementById('lightIntensity').value) || 1;
    const lightDistance = parseFloat(document.getElementById('lightDistance').value) || 100;
    const ambientLightIntensity = parseFloat(document.getElementById('ambientLight').value) || 0.5;
    const lightAngle = parseFloat(document.getElementById('lightAngle').value) || 0.785;
    const lightPenumbra = parseFloat(document.getElementById('lightPenumbra').value) || 1;
    const lightDecay = parseFloat(document.getElementById('lightDecay').value) || 2;

    // Shadow properties
    const shadowWidth = parseInt(document.getElementById('shadowWidth').value) || 4096;
    const shadowHeight = parseInt(document.getElementById('shadowHeight').value) || 4096;
    const shadowCamNear = parseFloat(document.getElementById('shadowCamNear').value) || 0.5;
    const shadowCamFar = parseFloat(document.getElementById('shadowCamFar').value) || 500;
    const shadowBias = parseFloat(document.getElementById('shadowBias').value) || -0.0001;

    // Material properties
    const metalness = parseFloat(document.getElementById('metalness').value) || 0;
    const roughness = parseFloat(document.getElementById('roughness').value) || 0.5;
    const displacementScale = parseFloat(document.getElementById('displacementScale').value) || 0.1;
    const alphaTest = parseFloat(document.getElementById('alphaTest').value) || 0.05;

    // Update light position and properties
    light.position.set(lightX, lightY, lightZ);
    light.intensity = lightIntensity;
    light.distance = lightDistance;
    light.angle = lightAngle;
    light.penumbra = lightPenumbra;
    light.decay = lightDecay;

    // Update shadow properties
    light.shadow.mapSize.width = shadowWidth;
    light.shadow.mapSize.height = shadowHeight;
    light.shadow.camera.near = shadowCamNear;
    light.shadow.camera.far = shadowCamFar;
    light.shadow.bias = shadowBias;

    // Update material properties
    material.metalness = metalness;
    material.roughness = roughness;
    material.displacementScale = displacementScale;
    material.alphaTest = alphaTest;

    // Update ambient light intensity
    ambientLight.intensity = ambientLightIntensity;
}

/*
// Function to capture the screenshot and display notification
function captureScreenshotNotification() {
    renderer.render(scene, camera); // Render the scene first

    // Capture the screenshot
    const screenshotDataURL = renderer.domElement.toDataURL('image/png');
    
    // Optional: You can download the screenshot or save it in a different way
    // For example, to download the screenshot:
    const link = document.createElement('a');
    link.href = screenshotDataURL;
    link.download = 'screenshot.png';
    link.click();

    // Show the notification
    showScreenshotNotification();
}
*/
function captureScreenshotNotification() {
    renderer.render(scene, camera); // Render the scene first

    // Capture the screenshot
    const screenshotDataURL = renderer.domElement.toDataURL('image/png');
    
    // Create a unique filename using the current timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
    const uniqueFilename = `screenshot_${timestamp}.png`;

    // Optional: You can download the screenshot or save it in a different way
    // For example, to download the screenshot:
    const link = document.createElement('a');
    link.href = screenshotDataURL;
    link.download = uniqueFilename;
    link.click();

    // Show the notification
    showScreenshotNotification();
}


// Function to show the notification
function showScreenshotNotification() {
    const notification = document.getElementById('screenshotNotification');
    notification.style.display = 'block';

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Add event listener for the screenshot capture button
document.getElementById('capture').addEventListener('click', captureScreenshotNotification);



// Add this function to send the screenshot to the server
function sendScreenshotToServer(dataURL) {
    fetch('/save_screenshot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'data_url=' + encodeURIComponent(dataURL)
    })
    .then(response => response.text())
    .then(data => console.log(data));
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (isReadyForScreenshot) {
        captureScreenshot();
        isReadyForScreenshot = false;
    }
}

//document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

// Event listener for "Update Light" button
document.getElementById('updateLight').addEventListener('click', (event) => {
    event.preventDefault();  // Prevent default button behavior
    updateLight();  // Call the update function
});

// Event listener for "Update Light" button
document.getElementById('capture').addEventListener('click', (event) => {
    isReadyForScreenshot = true;
    animate();  // Call the update function
});

setupSceneAndCapture();
