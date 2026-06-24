import http.server
import json
import os
import sys
import calculate
import updater

PORT = 8800

class CuccipoolRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/joris/":
            self.send_response(301)
            self.send_header("Location", "/joris")
            self.end_headers()
        elif self.path == "/joris":
            try:
                workspace = os.path.dirname(os.path.abspath(__file__))
                admin_path = os.path.join(workspace, "admin.html")
                with open(admin_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, f"Error serving admin panel: {str(e)}")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse actual results from client request
                actual_results = json.loads(post_data.decode('utf-8'))
                
                # Write to actual_results.json
                workspace = os.path.dirname(os.path.abspath(__file__))
                results_path = os.path.join(workspace, "actual_results.json")
                
                with open(results_path, "w", encoding="utf-8") as f:
                    json.dump(actual_results, f, indent=2, ensure_ascii=False)
                
                # Run the standing calculations to regenerate leaderboard.json
                calculate.main()
                
                # Respond success
                response = {"status": "success", "message": "Results saved and standings calculated"}
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                # Respond failure
                response = {"status": "error", "message": str(e)}
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

def run(server_class=http.server.HTTPServer, handler_class=CuccipoolRequestHandler):
    # Start the API updater background thread
    updater.start_api_updater()

    # Ensure standard simple http server handles root directory
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f"Cuccipool Server running on port {PORT}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
