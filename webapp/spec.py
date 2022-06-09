import io
import os

from apiclient.http import MediaIoBaseDownload
from bs4 import BeautifulSoup
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from webapp.spreasheet import DiscoveryCache
from dateutil.parser import parse


class GoogleDrive:
    def __init__(self):
        scopes = [
            "https://www.googleapis.com/auth/drive.readonly",
        ]
        creds = None
        # The file token.json stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first
        # time.
        if os.path.exists("token.json"):
            creds = Credentials.from_authorized_user_file("token.json", scopes)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    "credentials.json", scopes
                )
                creds = flow.run_local_server(port=60889)
            # Save the credentials for the next run
            with open("token.json", "w") as token:
                token.write(creds.to_json())
        self.service = build(
            "drive", "v2", credentials=creds, cache=DiscoveryCache()
        )

    def doc_html(self, document_id):
        request = self.service.files().export_media(
            fileId=document_id, mimeType="text/html"
        )
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            _, done = downloader.next_chunk()
        html = fh.getvalue().decode("utf-8")
        comments = (
            self.service.comments()
            .list(fileId=document_id)
            .execute()
            .get("items", [])
        )
        return html, comments


class Spec:
    html: BeautifulSoup
    metadata = {
        "index": "",
        "title": "",
        "status": "",
        "authors": [],
        "type": "",
        "created": "",
    }
    url = "https://docs.google.com/document/d/"

    def __init__(self, google_drive: GoogleDrive, document_id: str):
        self.url = f"{self.url}/{document_id}"
        raw_html, comments = google_drive.doc_html(document_id)
        self.html = BeautifulSoup(raw_html, features="lxml")
        self.clean()
        self.parse_metadata()

    def clean(self):
        empty_tags_selector = lambda tag: (
            not tag.contents or len(tag.get_text(strip=True)) <= 0
        ) and tag.name not in ["br", "img", "hr"]
        for element in self.html.findAll(empty_tags_selector):
            element.decompose()

    def parse_metadata(self):
        table = self.html.select_one("table")
        for table_row in table.select("tr"):
            cells = table_row.select("td")
            # invalid format | name | value |, ignoring the row
            if len(cells) != 2:
                continue
            attr_name, attr_value = cells
            attr_name = attr_name.text.lower().strip()
            attr_value = attr_value.text.strip()
            attr_value_lower_case = attr_value.lower()
            if attr_name in self.metadata:
                if attr_name in ["index", "title"]:
                    self.metadata[attr_name] = attr_value
                elif attr_name == "status":
                    if attr_value_lower_case in [
                        "approved",
                        "pending review",
                        "drafting",
                        "braindump",
                        "unknown",
                    ]:
                        self.metadata["status"] = attr_value_lower_case
                    else:
                        self.metadata["status"] = "unknown"
                elif attr_name == "authors":
                    self.metadata["authors"] = [
                        author.strip() for author in attr_value.split(",")
                    ]
                elif attr_name == "type":
                    if attr_value_lower_case in [
                        "standard",
                        "informational",
                        "process",
                    ]:
                        self.metadata["type"] = attr_value_lower_case
                    else:
                        self.metadata["type"] = "unknown"
                elif attr_name == "created":
                    self.metadata["created"] = parse(
                        attr_value_lower_case, fuzzy=True
                    )
        table.decompose()
