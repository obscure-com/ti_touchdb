#!/bin/bash
DATA=$(mktemp -d /tmp/liteserv.XXXXX)
cp -R CouchbaseLite/elements* ${DATA}
./bin/LiteServ --dir ${DATA} -Log YES -LogSync YES -LogSyncVerbose YES 
rm -Rf ${DATA}
