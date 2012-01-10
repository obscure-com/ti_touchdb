Structure of the CouchBooks documents:
------

*_id*: I chose to use the ISBN number as the document identifier. 
Eventually, I hope to include replication to a central book
database to the app, and ISBNs work well as global identifier.

*title*, *author*: self-explanatory, I hope...

*copyright*: the copyright field is a date in the form of an array
of [year, month, day], all 1-based.  I chose to use an array because
copyright feels more like a calendar date than a seconds-since-the-epoch
timestamp.  Also, with a timestamp, we could get different dates
displayed in the UI depending on the time zone of the device and
the hours, minutes, and seconds in the timestamp. 

The `_design/books/views/by_author` view outputs keys in the form
of `[author, title]`, which results in a sorted list of books by
author first, then title.
