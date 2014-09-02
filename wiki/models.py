from modularodm import StoredObject, fields


class WikiPageVersion(StoredObject):
    _meta = {'optimistic': True}
    _id = fields.StringField(primary=True, index=True)
    modified_on = fields.DateTimeField()
    text = fields.StringField(default=[''], list=True)

    @property
    def content(self):
        return '\n'.join(self.text)


class WikiPage(StoredObject):
    _meta = {'optimistic': True}
    _id = fields.StringField(primary=True, index=True)
    versions = fields.ForeignField('WikiPageVersion', backref='page',list=True)
    title = fields.StringField(unique=True)

    @property
    def current(self):
        return self.versions[-1]

    @property
    def content(self):
        return self.current.content

    def update(self, text):
        new = WikiPageVersion(text=text)
        new.save()
        self.versions.append(new)
