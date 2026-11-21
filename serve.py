from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SITE = "https://puppy.instabizweb.com"
ROOT = Path(__file__).resolve().parent


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        local_path = Path(self.translate_path(self.path))
        if self.path.startswith("/_next/") or not local_path.is_file():
            return self.proxy()
        return super().do_GET()

    def do_HEAD(self):
        local_path = Path(self.translate_path(self.path))
        if self.path.startswith("/_next/") or not local_path.is_file():
            return self.proxy(send_body=False)
        return super().do_HEAD()

    def proxy(self, send_body=True):
        method = "GET" if send_body else "HEAD"
        request = Request(SITE + self.path, headers={"User-Agent": "Mozilla/5.0"}, method=method)
        try:
            response = urlopen(request, timeout=20)
        except HTTPError as error:
            response = error
        except URLError as error:
            self.send_error(502, "Unable to reach live website", str(error.reason))
            return

        with response:
            body = response.read() if send_body else b""
            self.send_response(response.status)
            for name in ("Content-Type", "Cache-Control"):
                value = response.headers.get(name)
                if value:
                    self.send_header(name, value)
            content_length = response.headers.get("Content-Length")
            if content_length is None and send_body:
                content_length = str(len(body))
            if content_length is not None:
                self.send_header("Content-Length", content_length)
            self.end_headers()
            if send_body:
                self.wfile.write(body)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 4173), WebsiteHandler).serve_forever()
