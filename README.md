# Tornado Wiki Docs/Write up

## Routes
(Matched bottom to top)
* `/`
* `/(.*)/`
* `/api/v1/page/([^/]*)+/`
* `/api/v1/namespace/([^/]*)+/`
* `/api/v1/user/([^/]*)/permisions/`
* `/api/v1/search/`
* `/api/v1/socket/`

## Url Hierarchy

* `/`
    - Returns Index.html
* `/(.*)`
    - Returns Index.html embedded with `$1`
* `/api`
    - `v1`
        + `page`
            * `([^/]*)+`
                + `GET`: Get a wikipage
                + `PUT`: Update a wikipage
                + `POST`: Create a wikipage
                + `DELETE`: Delete a wikipage
        + `namespace`
            * `([^/]*)+`
                + `GET`: List the contents of a namespace
                + `PUT`: Update the permissions of a namespace
        + `user`
            * `([^/*])`
                + `permissions`
                    * `DELETE`: Remove a permission from a user
                    * `PUT`: Change a permission of a user
                    * `POST`: Add a permission to a user
        + `search`
            * `GET`: Preform a search
            * `POST`: Preform a search
        + `socket`
            * Used for live collaboration
            * Possibly just mapped to a shareJS server?

## View Functions
* Catch All/Index
    1.  `return render_template('index/html', $1)`
* Wikipages
    - Getting a wikipage
        1. Check for query string `?version=` and attempt to load that version other wise load current page
        1. Fetch raw markdown/markup from loaded wikipage
        2. `return {title: $L, content: ...}`
    - Updating a wikipage
        1. Ensure page exists otherwise return `405`
        2. Validate json
            - type: add/delete
            - location: linenumber:characternumber
            - edit: text to insert or number of character to delete
        3. Apply modification
    - Creating a wikipage
        1. Ensure page does not exist otherwise return `405`
        2. Create namespaces as needed
        2. If json is posted, use it as the base content
            - `{content: ...}`
    - Deleting a wikipage
        1. Set the `deleted` flag to True on the given page
* Namespaces
    - Settings the permissions of a namespace
        1. Parse json for `{permissions: ...}`
        2. Convert to a `WikiPermission`
        3. Set the permission for the specified namespace
    - Listing pages and subnamespaces of a namespace
        1. Check query string for `?namespaces` or `?pages`
        2. Include only requested listings
            * if none are specified return both
        3. Return the lists as json
    - Checking the permissions of a namespace
        1. Aquire the permissions of the current user
        2. Check again the specified namespace
        3. Return results in json
* Users
    - Adding permissions to a user
        1. Recurse down the users permissions tree adding nodes as required
        2. Set permissions
    - Removing permissions from a user
        1. Recurse down the users permissions tree
        2. Change `permissions` key to `None`
    - Editing permissions of a user
        1. See adding permissions to a user
* Searching
    - With a query string
        1. Extract query string from `?q=`
        2. search database with query
        3. return jsonified results
            + `{results: [1, 2, 3, ...]}`
    - With Json
        1. Extract query from json
            + `{q: ...}`
        2. search database with query
        3. return jsonified results
            + `{results: [1, 2, 3, ...]}`
    - Additional Notes:
        + If the query is empty or malformed no query shall be performed
            * return of `{results: []}`

## Generic flow
1. User accesses `URL` with `METHOD`
2. Match `URL`
    - Fall back to `/` if no matches and `METHOD` is `GET`
    - Otherwise return `404`
3. Attempt to load `RESOURCE` from `URL` regex capture
    - If any attempts to load fail and `METHOD` is `POST`
    - Otherwise return `404`
4. Attempt to authenticate `USER`
    - If `USER` can not be loaded return `403`
    - If `RESOURCE` is in the public domain continue
    - Check permissions of `USER` against `RESOURCE`
        + Continue if they pass
    - Otherwise return `403`
5. Attempt to load `VARIABLES` for the mapped view method
    - if `VARIABLES` can not be load or are malformed or incorrect return `400`
6. Execute view method


## Database Models

###Wikinamespace
* title
    - the name or title of the namespace
* pages
    - a list of wikipages in the given namespace 
    - The pages must all have a unique name
* children
    - a list of wikinamespaces under this one
* permissions
    - A `WikiPermission` for the entire namespace
        + defaults to None
* deleted
    - a field to indictate if the namespace has been deleted

###Wikipage
* versions
    - A list of references to wikipage versions
* current
    - a property that will return `self.versions[-1]`
* apply_diff
    - a method that will apply a diff to a copy of `self.current` and push that to `self.versions`
* title
    - The title of the wikipage
* deleted
    - a field to indictate if the page has been deleted

###Wikipage Version
* text
    - The raw markdown/markup for this version of the wikipage
* modified_on
    - a datetime of when this version was modified
* modified_by
    - The user that created this modification
* diff
    - A serialized version of a diff

###WikiUser
* username
    - a guid
* permissions
    - nested dictionary describing this users permissions

permissions will be described by the following enum
```python
class WikiPermission(Enum):
    Read = 1 # User can read all pages in the given namespace
    ReadWrite = 2 # User may read and write all pages in the given namespace
    ReadDecent = 3 # User may read all articles in the given namespace aswell as all pages in children namespaces
    ReadDecentWrite = 4 # User may write all pages in the given namespace as well as read all children pages
    ReadWriteDecent = 5 # User may read and write all pages in the given namespace as well as its children

    # Note: None can be used anywhere where a WikiPermission would be used to denote no permissions
    # Note: Read beings at 1 so that if Permissions: is valid for testing no permissions
```

```python
{
    'myproject': {
        'permissions': WikiPermission.Read
        'children': {
            'subject1': {
                'permissions': WikiPermission.ReadWriteDecent
            }
        }
    }
}
```

###Other options
As storing all full text versions of wikipages could become very large very fast the text field could be eliminated from the `wikipage verison` model and current on `wikipage` would just be a summation of all given diffs

## Authentication
Authentication is very subject to change.
For the moment it will be handle by a cookie based system either with *itsdangerous* or tornado's secure cookies

## Cross origin issues

### SockJS
SockJS handles CORS, so there is no issue here
```javascript
$.ajax({
  url: 'http://localhost:8080',
  async: false
});
//XMLHttpRequest cannot load http://localhost:8080/. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:7777' is therefore not allowed access. jquery.js:8623
```

```javascript
new SockJS('http://localhost:8080/chat');
//y {_options: Object, _base_url: "http://localhost:8080/chat", _server: "323",_protocols: Array[0], protocol: null…}
//Successful connection
```

###Server
Will need to set `Access-Control-Allow-Credentials` to true and `Access-Control-Allow-Origin` to *
In tornado:
```python
class BaseHandler(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Credentials', True)

```


## Suggested external usage
To preserve bandwidth it is recommended to interact via client side javascript

###Use case

####A User goes to view a wikipage
1. Users vists your sites wikipage
2. On load the javascript sends out a request to `/api/v1/cool%20wiki%20page` and displays the returned content

####A user goes to create a new wikipage
1. Load a page with an empty editor
2. When the user clicks save post the entered text to `/api/v1/cool%20wiki%20page`

####A user goes to edit a wikipage
tbd

## Additional Notes
* A namespace depth can be set by changing the `+` in the page matching regex to `{0, X}` where X is the max depth
* Wikipages with no namespace will be considered to be in the "public domain" and editable by **anyone**
