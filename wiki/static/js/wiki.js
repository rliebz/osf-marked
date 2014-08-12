(function() {
    var self = {};

    self.socket =  new SockJS('/sock');
    self.cbs = [];

    self.getPage = function(title, cb) {
        options = {
            method: 'GET',
            page: title
        }
        self.cbs.unshift(cb);
        return self.socket.send(JSON.stringify(options));
    };

    self.savePage = function(title, text) {
        options = {
            method: 'PUT',
            page: title,
            content: text
        }
        return self.socket.send(JSON.stringify(options));
    }

    self.socket.onopen = function() {
    };

    self.socket.onmessage = function(e) {
        cb = self.cbs.pop();
        if (cb !== undefined) cb(e.data);
        console.log(e);

    };

    self.socket.onclose = function() {

    };

    window.w = self;
})();

var wiki = {
    Page: function(title, cb) {
        var self = this;
        self.title = title;
        self.fetched = function(data) {
            self.initText = data.content;
            cb(self);
        }
        w.getPage(title, self.fetched);
    },

    controller: function() {
        var self = this;

        self.requestedPage = m.prop('')
        self.currentPage =  null; //new wiki.Page('test');
        self.editor = new aceEditor.controller();

        self.save = function() {
            w.savePage(self.requestedPage(), self.editor.getText().split('\n'));
        }.bind(self);

        self.load = function() {
            if (self.requestedPage === '') return;
            if (self.currentPage != null && self.currentPage.title === self.requestedPage) return;

            self.currentPage = new wiki.Page(self.requestedPage(), self.editor.setPage);
        }.bind(self);
    },
    view: function(ctrl) {
        return m('div', [
            m('input', {onchange: m.withAttr("value", ctrl.requestedPage), value: ctrl.requestedPage()}),
            m('button', {onclick: ctrl.load}, 'Load'),
            m('button', {onclick: ctrl.save}, 'Save'),
            aceEditor.view(ctrl.editor)
        ]);
        return
    }

};

m.module(document.body, wiki);
