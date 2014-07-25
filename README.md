Ace, Marked, and ShareJS
========================

This repository contains the basic components necessary for editing and
rendering markdown, as well as collaborative editing through Share.


Requirements
------------
First make sure you have Node and npm. Then run:
```bash
 $ npm install share@"<0.7"
 $ npm install connect@"<2.0.0"
```


Quick Start
-----------
After installing the requirements, simply run 
```bash
 $ node app.js
```

The code editor can then be accessed at `localhost:8000`.

If you're using the Vagrantfile to run this code, you can access the editor
at `192.168.111.111:8000`.


Components
----------

### Ace ###
Ace is a code editor. The only modification here to Ace is that there is a
custom autocompleter aimed at completing OSF-specific code. Note that the
autocomplete is buggy, incomplete, and hardcoded to localhost:5000/ for data.
It needs significant work before it could be used--however, it is possible to
run the rest of this code without autocomplete capabilities. All of the code
for the custom Ace is split between `index.html` and `osf-language-tools.js`.


### Marked ###
Marked is a lightweight markdown renderer. It has github flavored markdown
built-in, but not a great interface for implementing custom markdown. Custom
OSF markdown is implemented in `osf-marked.js`, but the rest of this repo
does not depend on that custom markdown being implemented (although auto-
complete wouldn't make much sense). 

The custom markdown includes:
 
 - [[youtube:uid]] for embedding YouTube videos.
 - [[osf:user:uid]] and [[osf:project:uid]] for linking to users/projects
 - @[User Fullname](uid) and @[Project Name](uid) as links that point to osf
   pages. This syntax simply appends the uid to `http://localhost:5000`, so it
   can be used for any arbitrary OSF page, such as @[OSF Settings](settings) or
   @[OSF Wiki](uid/wiki)
 - [[TOC]] will render a table of contents that organizes headers and links to
   them on the page. This is case-insensitive. Headers not structured properly
   (e.g., an h3 following an h1) will be omitted.
   
   
### ShareJS ###
Share JS is a collaborative editing tool. We're currently using version 0.6, 
which is better documented, but with fewer features. The biggest one we're
waiting on is cursor position for multiple users, which is on ShareJS's list
of 1.0 features, but there's no indication as to when that will come. After
spending some time investigating, it seems to be a pretty monumental task.