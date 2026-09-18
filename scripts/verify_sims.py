"""Read-only release smoke checks; credentials come from environment variables."""
import json
import os
from html.parser import HTMLParser
from pathlib import Path
import urllib.request


class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            source = dict(attrs).get("src")
            if source:
                self.sources.append(source)


def main():
    base = os.environ.get("SIMS_URL", "https://client.flextvx.xyz").rstrip("/")
    request = urllib.request.Request(base + "/api/v1/auth/login", data=json.dumps({
        "username": os.environ.get("SIMS_ADMIN_USER", "admin"), "password": os.environ["SIMS_ADMIN_PASSWORD"]
    }).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        token = json.load(response)["token"]
    print("Administrator login passed")
    for path in ["/students", "/students/classes", "/teachers", "/teachers/subjects", "/exams", "/timetables/slots", "/fees/accounts", "/fees/payments"]:
        request = urllib.request.Request(base + "/api/v1" + path, headers={"Authorization": "Bearer " + token})
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.load(response)
            assert isinstance(data, list), path
        print(f"GET {path}: passed ({len(data)} records)")
    local = Scripts()
    local.feed((Path(__file__).resolve().parents[1] / "client/dist/index.html").read_text())
    remote = Scripts()
    with urllib.request.urlopen(base + "/", timeout=30) as response:
        remote.feed(response.read().decode())
    assert local.sources == remote.sources, "Published frontend does not match the local build"
    for source in remote.sources:
        with urllib.request.urlopen(base + source, timeout=30) as response:
            assert response.status == 200
    print("Published frontend matches local build; JavaScript assets are reachable")


if __name__ == "__main__":
    main()
