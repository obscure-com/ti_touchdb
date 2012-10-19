TouchBooks Web
==============

The TouchBooks Web application provides a web-based interface for viewing and editing
data synced to a CouchDB server from the TouchBooksAlloy demo application.  The web
app is built with [Kanso](http://kan.so/) and is based off the 
[kanso-spine-contacts](https://github.com/pegli/kanso-spine-contacts) sample app.

Installation
------------

1. Install the Kanso build tool according to the instructions on http://kan.so/
1. cd to `TouchBooksWeb` and run `kanso push http://username:password@mycouchdbhost.com/dbname`
where `mycouchdbhost` is the hostname of the CouchDB server (and port, if needed) and
dbname is the name of the CouchDB database on that server that is storing data from
TouchBooksAlloy.
1. Open `http://mycouchdbhost.com/dbname/_design/TouchBooksWeb/_rewrite` in a browser.

If you're using [IrisCouch](http://iriscouch.com/) for CouchDB hosting, you can set up one
of the CNAMEs for your instance as a virtual host that points directly to your app.  See
[this support forum post](https://getsatisfaction.com/iriscouch/topics/botched_vhosts_config)
for more information.

