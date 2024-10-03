from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import requests
from PIL import Image
from io import BytesIO
import time

def save_image_from_flask(image_path, normal_map_path, depth_map_path):
    # Set the paths to your local Chrome and ChromeDriver
    chrome_driver_path = "/home/ec2-user/harmonization/main/chromedriver-linux64/chromedriver"
    chrome_binary_path = "/home/ec2-user/harmonization/main/chrome-linux64/chrome"

    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.binary_location = chrome_binary_path

    # Set up the Chrome WebDriver with the specified driver path
    service = Service(executable_path=chrome_driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Construct the URL with the provided paths
    url = f"http://52.66.168.116:8000/?image={image_path}&normalMap={normal_map_path}&depthMap={depth_map_path}"
    driver.get(url)
    print(driver.title)
    
    # Close the browser
    driver.quit()
    

if __name__ == '__main__':
    save_image_from_flask('static/images/img02.png', 'static/images/norm01.png', 'static/images/depth02.png')