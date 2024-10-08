import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "/home/rohit/Downloads/threejs/photoAppFinal"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()

    
#python start_server.py
