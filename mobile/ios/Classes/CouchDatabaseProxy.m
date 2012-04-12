//
//  CouchDatabaseProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDatabaseProxy.h"
#import "CouchDesignDocumentProxy.h"
#import "CouchDocumentProxy.h"
#import "CouchPersistentReplicationProxy.h"
#import "CouchQueryProxy.h"
#import "CouchReplicationProxy.h"
#import "CouchRevisionProxy.h"
#import <CouchCocoa/RESTOperation.h>
#import <CouchCocoa/CouchDatabase.h>

@implementation CouchDatabaseProxy

@synthesize database=_database;

- (id)initWithCouchDatabase:(CouchDatabase *)db {
    if (self = [super init]) {
        self.database = db;
    }
    return self;
}

+ (CouchDatabaseProxy *)proxyWith:(CouchDatabase *)db {
    return db ? [[[CouchDatabaseProxy alloc] initWithCouchDatabase:db] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)relativePath {
    return self.database.relativePath;
}

#pragma mark METHODS

- (void)create:(id)args {
    RESTOperation * op = [self.database create];
    if (![op wait]) {
        NSAssert(op.error.code == 412, @"Error creating db: %@", op.error);
    }
}

- (id)ensureCreated:(id)args {
    BOOL result = [self.database ensureCreated:nil];
    return [NSNumber numberWithBool:result];
}

- (void)deleteDatabase:(id)args {
    RESTOperation * op = [self.database DELETE];
    if (![op wait]) {
        NSAssert(op.error.code == 200 || op.error.code == 404, @"Error deleting db: %@", op.error);
    }
}

- (void)compact:(id)args {
    RESTOperation * op = [self.database compact];
    if (![op wait]) {
        NSAssert(!op.error, @"Error compacting db: %@", op.error);
    }
}

- (id)getDocumentCount:(id)args {
    return [NSNumber numberWithInteger:[self.database getDocumentCount]];
}

- (id)documentWithID:(id)args {
    NSString * docid;
    ENSURE_ARG_AT_INDEX(docid, args, 0, NSString)
    
    CouchDocument * doc = [self.database documentWithID:docid];
    return doc ? [CouchDocumentProxy proxyWith:doc] : nil;
}

- (id)untitledDocument:(id)args {
    return [CouchDocumentProxy proxyWith:[self.database untitledDocument]];
}

- (id)getAllDocuments:(id)args {
    return [CouchQueryProxy proxyWith:[self.database getAllDocuments]];
}

- (id)getDocumentsWithIDs:(id)args {
    NSArray * docids;
    ENSURE_ARG_AT_INDEX(docids, args, 0, NSArray)
    return [CouchQueryProxy proxyWith:[self.database getDocumentsWithIDs:docids]];
}

- (void)putChanges:(id)args {
    NSArray * props;
    NSArray * revproxies;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSArray)
    ENSURE_ARG_OR_NIL_AT_INDEX(revproxies, args, 1, NSArray)
    
    if (revproxies) {
        NSMutableArray * revs = [NSMutableArray arrayWithCapacity:[revproxies count]];
        for (id rev in revproxies) {
            if ([rev isKindOfClass:[CouchDocumentProxy class]]) {
                [revs addObject:((CouchDocumentProxy *)rev).document];
            }
            else if ([rev isKindOfClass:[CouchRevisionProxy class]]) {
                [revs addObject:((CouchRevisionProxy *)rev).revision];
            }
        }
        
        RESTOperation * op = [self.database putChanges:props toRevisions:revs];
        if (![op wait]) {
            NSAssert(!op.error, @"Error putting changes to revisions: %@", op.error);
        }
    }
    else {
        RESTOperation * op = [self.database putChanges:props];
        if (![op wait]) {
            NSAssert(!op.error, @"Error putting changes: %@", op.error);
        }
        // TODO: [op resultObject] is an NSArray of CouchDocument objects; maybe return?
    }
    
}

- (void)deleteRevisions:(id)args {
    NSArray * revproxies;
    ENSURE_ARG_AT_INDEX(revproxies, args, 0, NSArray)
    
    NSMutableArray * revs = [NSMutableArray arrayWithCapacity:[revproxies count]];
    for (CouchRevisionProxy * proxy in revproxies) {
        [revs addObject:proxy.revision];
    }
    
    RESTOperation * op = [self.database deleteRevisions:revs];
    if (![op wait]) {
        NSAssert(!op.error, @"Error deleting revisions: %@", op.error);
    }
}

- (void)deleteDocuments:(id)args {
    NSArray * docproxies;
    ENSURE_ARG_AT_INDEX(docproxies, args, 0, NSArray)
    
    NSMutableArray * docs = [NSMutableArray arrayWithCapacity:[docproxies count]];
    for (CouchDocumentProxy * proxy in docproxies) {
        [docs addObject:proxy.document];
    }
    
    RESTOperation * op = [self.database deleteDocuments:docs];
    if (![op wait]) {
        NSAssert(!op.error, @"Error deleting documents: %@", op.error);
    }
}

- (void)clearDocumentCache:(id)args {
    [self.database clearDocumentCache];
}

#pragma mark QUERIES & DESIGN DOCUMENTS:

- (id)slowQuery:(id)args {
    NSString * map;
    NSString * reduce;
    NSString * language;
    
    ENSURE_ARG_AT_INDEX(map, args, 0, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(reduce, args, 1, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(language, args, 2, NSString)

    if (reduce) {
        return [CouchQueryProxy proxyWith:[self.database slowQueryWithMap:map reduce:reduce language:language]];
    }
    else {
        return [CouchQueryProxy proxyWith:[self.database slowQueryWithMap:map]];
    }
}

- (id)designDocumentWithName:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)    
    return [CouchDesignDocumentProxy proxyWith:[self.database designDocumentWithName:name]];
}

#pragma mark CHANGE TRACKING:

- (id)tracksChanges:(id)args {
    return [NSNumber numberWithBool:[self.database tracksChanges]];
}

- (id)lastSequenceNumber:(id)args {
    return [NSNumber numberWithUnsignedInteger:[self.database lastSequenceNumber]];
}

#pragma mark REPLICATION & SYNCHRONIZATION:

- (id)pullFromDatabaseAtURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    NSLog(@"pull replication from %@", url);
    
    return [CouchReplicationProxy proxyWith:[self.database pullFromDatabaseAtURL:url]];
}

- (id)pushToDatabaseAtURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    return [CouchReplicationProxy proxyWith:[self.database pushToDatabaseAtURL:url]];
}

- (id)replicateWithURL:(id)args {
    NSString * urlstr;
    NSNumber * exclusively;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(exclusively, args, 1, NSNumber)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    NSArray * reps = [self.database replicateWithURL:url exclusively:[exclusively boolValue]];
    
    return [NSArray arrayWithObjects:[CouchReplicationProxy proxyWith:[reps objectAtIndex:0]], [CouchReplicationProxy proxyWith:[reps objectAtIndex:1]], nil];
}

- (id)replicationFromDatabaseAtURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    return [CouchPersistentReplicationProxy proxyWith:[self.database replicationFromDatabaseAtURL:url]];
}

- (id)replicationToDatabaseAtURL:(id)args {
    NSString * urlstr;
    ENSURE_ARG_AT_INDEX(urlstr, args, 0, NSString)
    
    NSURL * url = [NSURL URLWithString:urlstr];
    return [CouchPersistentReplicationProxy proxyWith:[self.database replicationToDatabaseAtURL:url]];
}

- (id)replications:(id)args {
    NSArray * reps = [self.database replications];
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[reps count]];
    
    for (CouchPersistentReplication * rep in reps) {
        [result addObject:[CouchPersistentReplicationProxy proxyWith:rep]];
    }
    
    return result;
}

@end
