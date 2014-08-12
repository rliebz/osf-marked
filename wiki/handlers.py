import json

import tornado.web

import sockjs.tornado

from modularodm.exceptions import NoResultsFound
from modularodm.query.querydialect import DefaultQueryDialect as Q

from models import WikiPage, WikiPageVersion


STATIC_PATH = r'/static/(.*)'
STATIC_DIR = 'wiki/static'


def extra_routes():
    router = sockjs.tornado.SockJSRouter(WebSocketAPIEmulator, '/sock')
    static = (STATIC_PATH, tornado.web.StaticFileHandler, {'path': STATIC_DIR})
    return [static] + router.urls


class BaseHandler(tornado.web.RequestHandler):

    @classmethod
    def to_route(cls):
        return cls.url_pattern, cls


class WikiCrudHandler(BaseHandler):
    url_pattern = r'/api/v1/page/([^/]*)/?'

    def get(self, page_name):
        page = self.load_page(page_name)
        if page:
            version = self.get_argument('v', None)

            if version:
                try:
                    self.write({'content': page.versions[int(version)].content})
                except IndexError:
                    self.set_status(400)
            else:
                self.write({'content': page.content})
        else:
            self.write({'content': ''})

    def post(self, page_name):
        opts = json.loads(self.request.body)
        page = WikiPage(title=page_name)
        version = WikiPageVersion(text=opts.get('content', []))
        version.save()
        page.versions.append(version)
        page.save()
        self.set_status(201)

    def put(self, page_name):
        newtext = json.loads(self.request.body)['content']
        page = self.load_page(page_name)
        if not page:
            self.post(page_name)
            page = self.load_page(page_name)
        if not newtext or not ''.join(newtext):
            self.set_status(400)
            return
        page.update(newtext)

    def load_page(self, page_name):
        try:
            return WikiPage.find_one(Q('title', 'eq', page_name))
        except NoResultsFound:
            return None


class IndexHandler(BaseHandler):
    url_pattern = r'/([^/]*)/?'

    def get(self, path):
        self.render('static/index.html', title=path)


class WebSocketAPIEmulator(sockjs.tornado.SockJSConnection):
    participants = set()

    def on_open(self, info):
        # Add client to the clients list
        self.participants.add(self)

    def on_message(self, message):
        msg = json.loads(message)

        if msg['method'] == 'GET':
            self.get(msg['page'])
        elif msg['method'] == 'POST':
            self.post(msg['page'], msg.get('content', ''))
        elif msg['method'] == 'PUT':
            self.put(msg['page'], msg['content'])

    def get(self, title):
        page = self.load_page(title)

        if not page:
            return self.send({'content': ''})
        return self.send({'content': page.content})

    def post(self, title, content):
        page = self.load_page(title)

        if not page:
            page = WikiPage(title=title)
            page.save()

        self.put(title, content)

    def put(self, title, content):
        page = self.load_page(title)

        if not page:
            self.post(title, content)

        version = WikiPageVersion(text=content)
        version.save()
        page.versions.append(version)
        page.save()

    def on_close(self):
        self.participants.remove(self)

    def load_page(self, page_name):
        try:
            return WikiPage.find_one(Q('title', 'eq', page_name))
        except NoResultsFound:
            return None
