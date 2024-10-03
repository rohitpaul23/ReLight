from flask import Flask, request, render_template, send_from_directory, Response, send_file
import base64
from PIL import Image
from io import BytesIO

app = Flask(__name__, static_folder='static')

'''
@app.route('/')
def index():
    return render_template('index.html')
'''

@app.route('/')
def index():
    # Here, we pass the image paths as query parameters
    image = request.args.get('image', 'images/img01.png')  # Default image if no parameter is passed
    normal_map = request.args.get('normalMap', 'images/norm01.png')
    depth_map = request.args.get('depthMap', 'images/depth01.png')

    # Pass the image paths to the template
    return render_template('index.html', image=image, normal_map=normal_map, depth_map=depth_map)


@app.route('/save_screenshot', methods=['POST'])
def save_screenshot():
    data_url = request.form['data_url']
    
    image_data = base64.b64decode(data_url.split(',')[1])
    
    image = Image.open(BytesIO(image_data))
    image.save('static/temp.png')
    print('Saved Successfully')
    
    return 'Screenshot captured and saved successfully'


@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
