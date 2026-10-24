# Servidor estático de desenvolvimento sem cache (para ver alterações na hora).
import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, *args):
        pass


port = int(sys.argv[1]) if len(sys.argv) > 1 else 5317
http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
