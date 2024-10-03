# ReLight
A project for interactive 3D lighting and texture manipulation using React and Three.js

## Overview
ReLight is a web application built with Flask and Three.js that allows users to interact with 3D models. The application aims to provide a seamless experience for visualizing and manipulating 3D objects in a web browser.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Python 3.6+**
- **Flask**: Install Flask using pip.
  ```bash
  pip install Flask
  ```
- **Node.js**: Required for building any front-end assets.

## Installation
-  **Clone the repository**:
  ```bash
  git clone https://github.com/rohitpaul23/ReLight.git
  cd ReLight
  ```
-  **Starting the Application**
To start the application, navigate to the project directory and run:
  ```bash
  python flask_app.py
  ```
This command will start a local server, and you can access the application in your web browser at http://localhost:8000 or http://127.0.0.1:8000/

## Use Cases
**Basic Usage**
Open the Application: Navigate to http://localhost:8000 in your web browser.
User Interface: The home page features options to upload images with Depth and Normal, and manipulate the lighting condition, and view them in 3D.

**Uploading Models**
Select Model: Click on the 'Upload Model' button.
File Selection: Choose a image file from your device 
View Model: Once uploaded, the model will be rendered in the viewer section of the application.

**Features**
The application provides several features for manipulating models through light and shadow adjustments, as well as material properties. 

### Light and Shadow Adjustments
Users can adjust the direction of the light source using Light X, Y, and Z parameters, with default values of 1, 1, and 2, respectively. The Intensity of the light can be controlled with a default value of 2, while the Distance parameter, set at 100, determines how far the light reaches. Ambient Light, which sets the overall light in the scene, has a default value of 0.5. The Angle of the light is adjustable with a default of 0.785, and Penumbra, set to 1, controls the softness of shadow edges. The Decay parameter, with a default value of 2, affects how quickly light diminishes over distance.

### Shadow Information
For shadow management, users can configure the Shadow Width and Height to 4096, influencing the resolution of shadows, while Shadow Cam Near and Far parameters, set at 0.5 and 500 respectively, determine the clipping planes of the shadow camera. Shadow Bias, with a default of -0.0001, helps reduce shadow artifacts.

### Material Properties
Material properties can be fine-tuned using the Metalness and Roughness parameters to define the surface's metallic and rough characteristics (default values to be specified). The Displacement Scale controls the height of the displacement, and Alpha Test determines whether to discard pixels based on alpha values, both of which also require default values.

### Additional Feature
Users can capture screenshots of the rendered models at any time, enabling easy sharing and documentation of their visual adjustments and enhancements.


## Technologies Used
- ***Flask***: A lightweight Python web framework for building web applications.
- ***Three.js***: A JavaScript library for rendering 3D graphics in the browser.
- ***HTML/CSS/JavaScript***: Standard web technologies for building the front end of the application.

## Contributing
Contributions are welcome! If you have suggestions for improvements or features, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
