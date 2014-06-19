#!/bin/bash
DATA=$(mktemp -d /tmp/liteserv.XXXXX)
cp -R ../assets/CouchbaseLite/elements* ${DATA}
./bin/LiteServ --dir ${DATA} -Log YES -LogSync YES -LogSyncVerbose YES 
rm -Rf ${DATA}
