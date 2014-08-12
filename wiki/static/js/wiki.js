var aceEditor = {
    controller: function() {
        var self = this;
        self.editor = null;

        self.config = function(element, isInitialized) {
            if(isInitialized) return;
            self.editor = ace.edit(element.id);
            self.editor.on('change', m.redraw);
            self.editor.getSession().setMode("ace/mode/markdown");
        };

        self.getText = function() {
            if (self.editor === null) return '';
            return self.editor.getSession().getValue();
        };

        self.setText = function(text) {
            if (self.editor === null) return '';
            return self.editor.getSession().setValue(text);
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

var wiki = {
    controller: function() {
        var self = this;
        self.editor = new aceEditor.controller();

        self.save = function() {

        };
    },
    view: function(ctrl) {
        return aceEditor.view(ctrl.editor);
    }

};

m.module(document.body, wiki);
