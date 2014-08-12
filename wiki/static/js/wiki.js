

var wiki = {
    Page: function(title, cb) {
        var self = this;
        self.title = title;
        m.request({
            method: 'GET',
            url: '/api/v1/page/' + title,
            unwrapSuccess: function(response) {
                self.initText = response.content;
                cb(self);
            },
            unwrapFailure: function(response) {
                self.initText = '';
                cb(self);
            }
        });
    },

    controller: function() {
        var self = this;

        self.requestedPage = m.prop('')
        self.currentPage =  null; //new wiki.Page('test');
        self.editor = new aceEditor.controller();

        self.save = function() {
            m.request({
                method: 'PUT',
                url: '/api/v1/page/' + self.requestedPage(),
                data: {
                    content: self.editor.getText().split('\n')
                }
            });

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
