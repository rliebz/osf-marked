import tornado.ioloop

from wiki import enable_storage, gather_routes


if __name__ == '__main__':
    enable_storage()

    app = tornado.web.Application(gather_routes(), debug=True)

    app.listen(7777)

    tornado.ioloop.IOLoop.instance().start()
