var aceEditor = {
    controller: function() {
        var self = this;

        self.doc = null;
        self.editor = null;

        self.share = new sharejs.Connection('ws://localhost:7007/');


        self.config = function(element, isInitialized) {
            if(isInitialized) return;

            self.editor = ace.edit(element.id);
            self.editor.on('change', m.redraw);
            self.editor.setReadOnly(true);
        };

        self.setOptions = function() {
            // AceJS editor cosmetic settings settings
            self.editor.getSession().setMode("ace/mode/markdown");
            self.editor.getSession().setUseWrapMode(true); // Wrap text
            self.editor.getSession().setUseSoftTabs(true); // Replace tabs with spaces
            // self.editor.renderer.setShowGutter(false); // Hides line numbers
        };

        self.setPage = function(page) {
            if (self.doc != null) {
                self.doc.close();
                self.doc.detach_ace();
            }

            self.share.open(page.title, 'text', function(error, doc) {
                if (error) {
                    console.error(error);
                    return;
                }

                self.doc = doc;

                if (self.doc.getText() !== page.initText) {
                    self.doc.del(0, self.doc.getLength());
                    self.doc.insert(0, page.initText);
                    self.doc.submitOp()
                }

                self.doc.attach_ace(self.editor);
                self.editor.setReadOnly(false);
            });
        };

        self.getText = function() {
            if (self.editor === null) return '';
            return self.editor.getSession().getValue();
        };

        self.markUp = function(){
            return m.trust(marked(self.getText()));
        }
    },

    view: function(ctrl) {
        return m('#aceEditor', [
            m('#rendered', ctrl.markUp()),
            m('#editor', {config: ctrl.config}),
        ]);
    }
}
