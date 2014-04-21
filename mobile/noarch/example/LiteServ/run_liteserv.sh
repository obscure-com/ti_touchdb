#!/bin/bash
DATA=$(mktemp -d /tmp/liteserv.XXXXX)
cp -R ../assets/CouchbaseLite/elements* ${DATA}
./bin/LiteServ --dir ${DATA} -LogSync -LogSyncVerbose
rm -Rf ${DATA}