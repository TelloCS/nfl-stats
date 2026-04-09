from abc import ABC, abstractmethod
from typing import Any
import string
from bs4 import BeautifulSoup

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US, en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "DNT": "1",
    "Referer": "https://www.google.com/"
}

PIPELINE_CONFIG = {
    "year": 2025,
    "season_type": 3,
    "start_week": 1,
    "end_week": 2
}

class Endpoint(ABC):
    base_url = None
    
    @abstractmethod
    async def send_api_request(self, *args, **kwargs) -> Any:
        pass

    @abstractmethod
    def transform(self) -> Any:
        pass

class EndpointGenerator(Endpoint):
    @abstractmethod
    async def spawn_tasks(self, *args, **kwargs) -> Any:
        pass

class WebScraping(Endpoint):
    source = None

    @abstractmethod
    async def send_api_request(self, *args, **kwargs) -> Any:
        pass

def generate_slug(name: str) -> str:
    name = ''.join([c for c in name if c not in string.punctuation])
    name = name.lower().replace(' ', '-')
    return name

class Table(object):
    def __init__(self, html: str, source: str):
        self.html = html
        self.source = source

    @property
    def parser(self):
        soup = BeautifulSoup(self.html, 'lxml')
        table = soup.find('table')
        headers = [th.get_text(strip=True) for th in table.find_all('th')]

        rows, i = table.find_all('tr'), 0
        if rows and rows[0].find('th'):
            i = 1

        old_table = []
        for row in rows[i:]:
            if self.source == "footballguys":
                td = row.find_all('td')
                data = [d.get_text(strip=True) for d in td]
            else:
                td = row.find_all('td')
                data = [d.get_text(strip=True) for d in td]

            team_name = self.clean_team_field(data[0])
            data[0] = team_name

            if len(data) == len(headers):
                row_dict = dict(zip(headers, data))
                old_table.append(row_dict)
        return old_table

    @property
    def parser2(self):
        soup = BeautifulSoup(self.html, 'lxml')
        thead = soup.find('table').find_all('thead')
        tbody = soup.find('table').find_all('tbody')
        positions = {'Tight End', 'Wide Receiver', 'Running Back', 'Quarterback'}
        res = []

        for table in zip(thead, tbody):
            headers = table[0]
            data = table[1]

            if headers.find('th').get_text() not in positions:
                continue
            
            headers = [th.get_text(strip=True) for th in headers.find_all('th')]
            headers[0], headers[-1] = 'Player', 'Total'

            for td in data.find_all('tr'):
                _data = []
                for r in td.find_all('td'):
                    td = r
                    if td.find('a'):
                        row = td.find('a').get_text(strip=True)
                    elif td.find('b'):
                        row = td.find('b').get_text(strip=True)
                    else:
                        row = td.get_text(strip=True)
                    _data.append(row)

                    if len(_data) == len(headers):
                        mapping = dict(zip(headers, _data))
                        res.append(mapping)
        return res

    def clean_team_field(self, value: str):
        if self.source == 'nfl':
            mid = len(value) // 2
            return value[:mid + (len(value) % 2)]
        elif self.source == 'sumer':
            value = value.split(' ')[-1]
            return value
        else:
            return value
