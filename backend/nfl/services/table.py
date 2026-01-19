from bs4 import BeautifulSoup
from pprint import pprint

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
        """
        one table -> theads and tbodies

        h = ['h1', 'h2', 'hn', ...]
        d = ['d1', 'd2', 'dn', ...]

        dict(zip(h, d))
        
        """

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