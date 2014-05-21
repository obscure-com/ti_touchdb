# Replication Testing

One of the nagging issues with the module has been testing replication.  In the past,
I've used a database hosted on [IrisCouch](http://iriscouch.com/) as a pull replication
source.  Push replication wasn't tested at all because it was not possible to ensure
that the remote database either didn't exist or was empty without providing an admin
password in the requests.

In late 2013, Jens published the [LiteServ](https://github.com/couchbase/couchbase-lite-ios/tree/master/LiteServ%20App)
command-line tool and application wrapper code in the `couchbase-lite-ios` project.
LiteServ runs the Couchbase Lite HTTP API and can be used as a replication source or
target for testing.  In this document, I'll explain how the `ti_touchdb` replication
tests are configured and how to set up LiteServ as a replication partner.

## Configuration

Unit tests that use replication are configured using a file named `example/replication_config.json`.
The file looks like this:

    {
      "host": "localhost",
      "port": 59840,
      "dbname": "elements"
    }

The `host` and `port` parameters should be self-explanatory.  The `dbname` parameter
must contain the name of the "elements" database on the remote server.  "Elements" is
a pre-packaged database located in `example/assets/CouchbaseLite`; the pull replication
test expects that database as a source.  You can set the values in the config file to
point to an IrisCouch or Cloudant server if you prefer, with the caveat that the server
must be in admin party mode in order for the push replication unit test to succeed.
I find it much easier to run a local LiteServ instance, however.  The next section
describes how to install and run LiteServ.

## Using LiteServ

At this time, the only way to get the LiteServ binary is to build it from source.  Clone
the [Couchbase Lite iOS](https://github.com/couchbase/couchbase-lite-ios) repo from
GitHub and open `CouchbaseLite.xcodeproj` in Xcode.  Select the "LiteServ" target (not
"LiteServ App") from the list of targets and build it.  When the build is complete, open
the "Products" tab at the bottom of the left-hand pane, command-click on LiteServ, and
select "Show in Finder".  Copy the LiteServ executable to the `bin` directory in this
folder.  Locate the `CouchbaseLite.framework` and `CouchbaseLiteListener.framework`
bundles in the same manner and copy them to the `Frameworks` directory.  When you are
finished, the directory structure should look like this:

    .
    ├── Frameworks
    │   ├── CouchbaseLite.framework
    │   └── CouchbaseLiteListener.framework
    ├── README.md
    ├── bin
    │   └── LiteServ
    └── run_liteserv.sh


Once LiteServ is installed, use the `run_liteserv.sh` file in this directory to start
the server.  You should see the following in your Terminal window:

    14:17:29.587| LiteServ 1.5 is listening at <http://10.8.17.106:59840/> ... relax!

The shell script creates a new, temporary directory for LiteServ databases,
copies the "elements" database to that directory, and runs the LiteServ executable.
Once the server is running, you can execute the ti_touchdb unit tests in another
window.  When you are done running tests, use control-C to stop the LiteServ server.

