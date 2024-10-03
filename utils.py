import cv2
import numpy as np
from PIL import Image

def find_lighting_direction(image, mask, draw=False):
    """
    Find the lighting direction based on the brightest point on the chromeball.
    
    Parameters:
    image (numpy.ndarray): The image array with the scene and chromeball.
    mask (numpy.ndarray): The mask array with a circular mask in the middle representing the chromeball.
    draw (bool): If True, the input image will be returned with the light source marked. Default is False.
    
    Returns:
    tuple: A normalized tuple representing the direction vector from the center of the image to the brightest point.
    numpy.ndarray (optional): The input image with the light source marked, returned if draw is True.
    """
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply the mask to the grayscale image
    masked_gray = cv2.bitwise_and(gray, gray, mask=mask)
    
    # Find the minimum and maximum values and their locations in the masked image
    minVal, maxVal, minLoc, maxLoc = cv2.minMaxLoc(masked_gray)
    
    # Calculate the center of the image
    center = (image.shape[1] // 2, image.shape[0] // 2)
    
    # Calculate the direction vector from the center of the image to the brightest point
    direction = (maxLoc[0] - center[0], maxLoc[1] - center[1])
    
    # Calculate the radius of the circular mask
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        _, _, w, h = cv2.boundingRect(largest_contour)
        radius = max(w, h) / 2
    
    # Normalize the direction vector to have a maximum magnitude of 10
    normalized_direction = (direction[0] * 10 / radius, direction[1] * 10 / radius)
    
    # Mark the light source on the image if requested
    if draw:
        marked_image = image.copy()
        cv2.drawMarker(marked_image, maxLoc, (0, 255, 0), cv2.MARKER_CROSS, markerSize=10, thickness=2)
        return normalized_direction, marked_image
    else:
        return normalized_direction




def find_light_intensity(image, mask):
    """
    Find the light intensity based on the brightest point on the chromeball
    and calculate the average light intensity in the masked area.
    
    Parameters:
    image_path (str): The path to the image with the scene and chromeball.
    mask_path (str): The path to the mask image with a circular mask in the middle representing the chromeball.
    
    Returns:
    maxVal (int): The intensity of the brightest point. Value range is 0-255 where 0 is black and 255 is the brightest white.
    avgVal (float): The average light intensity within the masked area. Value range is 0-255.
    """
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply the mask to the grayscale image
    masked_gray = cv2.bitwise_and(gray, gray, mask=mask)
    
    # Calculate the average intensity in the masked area by excluding the zero values of the mask
    avgVal = np.sum(masked_gray) / np.count_nonzero(mask)
    
    # Find the minimum and maximum values in the masked image
    minVal, maxVal, minLoc, maxLoc = cv2.minMaxLoc(masked_gray)
    
    return maxVal, avgVal



import numpy as np
import cv2
from PIL import Image

def analyze_light_in_chrome_ball(rgb_image, mask_image, draw=False):

    # Ensure mask is binary
    _, mask_image = cv2.threshold(mask_image, 128, 255, cv2.THRESH_BINARY)

    # Isolate the chrome ball using the mask
    chrome_ball = cv2.bitwise_and(rgb_image, rgb_image, mask=mask_image)

    # Convert to HSV for easier analysis
    chrome_ball_hsv = cv2.cvtColor(chrome_ball, cv2.COLOR_BGR2HSV)

    # Analyze the chrome ball to determine the light characteristics
    # Find the brightest point - indicates the main light source direction
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(chrome_ball_hsv[:, :, 2])

    # Determine the spread of the light
    light_spread = np.std(chrome_ball_hsv[:, :, 2])

    # Determine the quality of light
    contrast = np.max(chrome_ball_hsv[:, :, 2]) - np.min(chrome_ball_hsv[:, :, 2])

    # Define the quality of the light based on the contrast and spread
    quality = "hard" if contrast > 128 else "soft"
    intensity = "high" if max_val > 128 else "low"
    spread = "narrow" if light_spread < 64 else "wide"

    # If draw is True, draw a circle on the brightest point in the original image
    if draw:
        # The circle will be red, with a radius of 10 pixels, and a thickness of 2 pixels
        cv2.circle(rgb_image, max_loc, 10, (0, 0, 255), 2)

    # Return the analysis and the modified image (if draw is True)
    analysis = {
        "brightest_point": max_loc,
        "light_spread": light_spread,
        "light_contrast": contrast,
        "quality": quality,
        "intensity": intensity,
        "spread": spread
    }

    if draw:
        return analysis, rgb_image
    else:
        return analysis




def estimate_color_temperature(image, mask):
    """
    Estimate the color temperature of the lighting based on the average color within the chromeball.
    
    Parameters:
    image_path (str): The path to the image with the scene and chromeball.
    mask_path (str): The path to the mask image with a circular mask in the middle representing the chromeball.
    
    Returns:
    str: The estimated color temperature of the light ('Warm', 'Cool', or 'Unknown').
    """
    # Apply the mask to the BGR image
    masked_bgr = cv2.bitwise_and(image, image, mask=mask)
    
    # Calculate the average color within the masked region
    bgr = np.average(masked_bgr, axis=(0, 1))
    
    # Determine the color temperature based on the BGR values
    color_temp = 'Unknown'
    if bgr[2] > bgr[1] and bgr[2] > bgr[0]:
        color_temp = 'Warm'
    elif bgr[0] > bgr[1] and bgr[0] > bgr[2]:
        color_temp = 'Cool'
    return color_temp


import cv2
import numpy as np

def find_multiple_light_sources(image, mask, threshold=240, draw=False):
    """
    Find multiple light sources based on the chromeball reflections and optionally mark them on the image.
    
    Parameters:
    image_path (str): The path to the image with the scene and chromeball.
    mask_path (str): The path to the mask image with a circular mask in the middle representing the chromeball.
    threshold (int): The threshold for binary thresholding to identify bright spots. Default is 240.
    draw (bool): If True, the input image will be returned with the light sources marked. Default is False.
    
    Returns:
    list: A list of tuples, each representing the relative (x, y) coordinates of a detected light source.
    Image (optional): The input image with the light sources marked, returned if draw is True.
    """
    
    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply the mask to the grayscale image
    masked_gray = cv2.bitwise_and(gray, gray, mask=mask)
    
    # Apply a binary threshold to the masked image to identify bright spots
    _, binary = cv2.threshold(masked_gray, threshold, 255, cv2.THRESH_BINARY)
    
    # Find contours of the bright spots
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Calculate the center of the image
    center = (image.shape[1] // 2, image.shape[0] // 2)
    
    # Identify the centroids of the contours as light sources and adjust coordinates to be relative to the center
    light_sources = []
    for contour in contours:
        M = cv2.moments(contour)
        if M["m00"] != 0:
            cX = int(M["m10"] / M["m00"]) - center[0]
            cY = int(M["m01"] / M["m00"]) - center[1]
            light_sources.append((cX, cY))
            
            # Mark the light sources on the image if requested
            if draw:
                cv2.drawMarker(image, (cX + center[0], cY + center[1]), (0, 255, 0), cv2.MARKER_CROSS, markerSize=10, thickness=2)
    
    if draw:
        return light_sources, image
    else:
        return light_sources
