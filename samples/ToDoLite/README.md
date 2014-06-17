# ToDoLite Sample App

This sample app is designed to be a functional equivalent of the [ToDoLite](https://github.com/couchbaselabs/ToDoLite-iOS)
example provided by Couchbase.

## Setup

1. Install the TiTouchDB module using gittio or by copying the module ZIP files to this directory.
1. Create a directory named `app/assets/alloy/sync` and copy the `titouchdb.js` sync adapter file
   to that directory.  If you have cloned this project from Github, you can make a symlink by
   running `ln -s ../../../../mobile/noarch/alloy app/assets/`.
1. TODO set up remote database to sync to.
1. Build and run as usual.

## Known Issues

TODO list differences between Couchbase ToDoLite and this app

## FAQ

*Why are the event handler names so weird?  It's almost like I'm reading Objective-C!*

I named views, methods, and classes based on their correspondance with the original ToDoLite
application.  For example, `detail.js` contains an event handler named `shareButtonAction`,
which performs the same function as `shareButtonAction:` in `DetailViewController`. 
