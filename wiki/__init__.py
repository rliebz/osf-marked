from pymongo import MongoClient

from modularodm import storage

from .handlers import *
from .models import WikiPage, WikiPageVersion


def enable_storage():
    client = MongoClient()
    db = client['wikitest']
    WikiPageVersion.set_storage(storage.MongoStorage(db, collection='pageversion'))
    WikiPage.set_storage(storage.MongoStorage(db, collection='page'))


def gather_routes():
    return [
        klass.to_route()
        for klass in
        BaseHandler.__subclasses__()
    ] + [static_files()]
