/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import <TouchDB/TDView.h>
#import "TDDatabaseProxy.h"
#import "TDRevisionProxy.h"
#import "TDViewProxy.h"

@implementation TDDatabaseProxy

@synthesize database;

#pragma mark Lifecycle

- (id)initWithTDDatabase:(TDDatabase *)db {
    if (self = [super init]) {
        self.database = db;
    }
    return self;
}

#pragma mark -
#pragma mark Platform Utils

+ (void)dispatchCallback:(KrollCallback *)cb forError:(NSError *)err {
    if (err && cb) {
        NSDictionary * dict = [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithInt:[err code]], @"code", [err domain], @"domain", [err localizedDescription], @"description", nil];
        [cb call:[NSArray arrayWithObject:dict] thisObject:nil];
    }
}

+ (NSArray *)toRevisionProxyArray:(NSArray *)revs {
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (TDRevision * rev in revs) {
        [result addObject:[[[TDRevisionProxy alloc] initWithTDRevision:rev] autorelease]];
    }
    return result;
}

+ (NSDictionary *)toDocumentDictionary:(NSDictionary *)dict {
    NSMutableDictionary * result = [NSMutableDictionary dictionaryWithDictionary:dict];
    for (NSString * key in [NSArray arrayWithObjects:@"docs", @"rows", nil]) {
        NSArray * v = [result valueForKey:key];
        if (v) {
            NSArray * converted = [self toRevisionProxyArray:v];
            [result setValue:converted forKey:key];
        }
    }
    return result;
}

+ (void)populateQueryOptions:(TDQueryOptions *)options fromDict:(NSDictionary *)dict {
    if (!dict || !options) return;
    
    options->startKey = [dict valueForKey:@"startKey"];
    options->endKey = [dict valueForKey:@"endKey"];
    options->keys = [dict valueForKey:@"keys"];
    
    if ([dict valueForKey:@"skip"]) options->skip = [[dict valueForKey:@"skip"] intValue];
    if ([dict valueForKey:@"limit"]) options->limit = [[dict valueForKey:@"limit"] intValue];
    if ([dict valueForKey:@"groupLevel"]) options->groupLevel = [[dict valueForKey:@"groupLevel"] intValue];
    if ([dict valueForKey:@"content"]) options->content = [[dict valueForKey:@"content"] intValue];
    if ([dict valueForKey:@"descending"]) options->descending = [[dict valueForKey:@"descending"] boolValue];
    if ([dict valueForKey:@"includeDocs"]) options->includeDocs = [[dict valueForKey:@"includeDocs"] boolValue];
    if ([dict valueForKey:@"updateSeq"]) options->updateSeq = [[dict valueForKey:@"updateSeq"] boolValue];
    if ([dict valueForKey:@"inclusiveEnd"]) options->inclusiveEnd = [[dict valueForKey:@"inclusiveEnd"] boolValue];
    if ([dict valueForKey:@"reduce"]) options->reduce = [[dict valueForKey:@"reduce"] boolValue];
    if ([dict valueForKey:@"group"]) options->group = [[dict valueForKey:@"group"] boolValue];
}

- (TDView *) compileView:(NSString *)viewName fromProperties:(NSDictionary *)viewProps {
    NSString * language = [viewProps objectForKey: @"language"] ?: @"javascript";
    NSString * mapSource = [viewProps objectForKey: @"map"];
    if (!mapSource)
        return nil;
    TDMapBlock mapBlock = [[TDView compiler] compileMapFunction:mapSource language:language];
    if (!mapBlock) {
        NSLog(@"[WARNING] View %@ has unknown map function: %@", viewName, mapSource);
        return nil;
    }
    NSString* reduceSource = [viewProps objectForKey: @"reduce"];
    TDReduceBlock reduceBlock = NULL;
    if (reduceSource) {
        reduceBlock =[[TDView compiler] compileReduceFunction: reduceSource language: language];
        if (!reduceBlock) {
            NSLog(@"[WARNING] View %@ has unknown reduce function: %@", viewName, reduceSource);
            return nil;
        }
    }
    
    TDView * view = [self.database viewNamed:viewName];
    [view setMapBlock:mapBlock reduceBlock:reduceBlock version: @"1"];
    
    NSDictionary * options = [viewProps objectForKey: @"options"];
    if ([@"raw" isEqualToString:[options objectForKey: @"collation"]])
        view.collation = kTDViewCollationRaw;
    return view;
}

#pragma mark -
#pragma mark TDDatabase

- (id)path {
    return self.database.path;
}

- (id)name {
    return self.database.name;
}

- (id)exists {
    return [NSNumber numberWithBool:self.database.exists];
}

- (id)totalDataSize {
    return [NSNumber numberWithLong:self.database.totalDataSize];
}

- (id)documentCount {
    return [NSNumber numberWithLong:self.database.documentCount];
}

- (id)lastSequence {
    return [NSNumber numberWithLong:self.database.lastSequence];
}

- (id)privateUUID {
    return self.database.privateUUID;
}

- (id)publicUUID {
    return self.database.publicUUID;
}

#pragma mark Lifecycle

- (id)open:(id)args {
    return [NSNumber numberWithBool:[self.database open]];
}

- (id)close:(id)args {
    return [NSNumber numberWithBool:[self.database close]];
}

- (id)deleteDatabase:(id)args {
    KrollCallback * cb;
    ENSURE_ARG_OR_NIL_AT_INDEX(cb, args, 0, KrollCallback);
    
    NSError * err;
    BOOL result = [self.database deleteDatabase:&err];
    
    if (!result) {
        [TDDatabaseProxy dispatchCallback:cb forError:err];
    }
    
    return [NSNumber numberWithBool:result];
}

- (BOOL) replaceWithDatabaseFile: (NSString*)databasePath
                 withAttachments: (NSString*)attachmentsPath
                           error: (NSError**)outError {
    // TODO!!!
}


- (id)beginTransaction:(id)args {
    return [NSNumber numberWithBool:[self.database beginTransaction]];
}

- (id)endTransaction:(id)args {
    NSNumber * commit;
    ENSURE_ARG_OR_NIL_AT_INDEX(commit, args, 0, NSNumber);
    
    BOOL result = [self.database endTransaction:(commit ? [commit boolValue] : YES)];
    return [NSNumber numberWithBool:result];
}

- (id)compact:(id)args {
    return [NSNumber numberWithInt:[self.database compact]];
}

#pragma mark Documents

- (id)getDocument:(id)args {
    NSString * docID;
    NSString * revID;
    NSNumber * contentOptions;
    
    ENSURE_ARG_AT_INDEX(docID, args, 0, NSString);
    ENSURE_ARG_OR_NIL_AT_INDEX(revID, args, 1, NSString);
    ENSURE_ARG_OR_NIL_AT_INDEX(contentOptions, args, 2, NSNumber);
    
    TDRevision * document = [self.database getDocumentWithID:docID revisionID:revID options:[contentOptions intValue]];
    return [[[TDRevisionProxy alloc] initWithTDRevision:document] autorelease];
}

- (id)existsDocument:(id)args {
    NSString * docID;
    NSString * revID;
    
    ENSURE_ARG_AT_INDEX(docID, args, 0, NSString);
    ENSURE_ARG_OR_NIL_AT_INDEX(revID, args, 1, NSString);
    
    return [NSNumber numberWithBool:[self.database existsDocumentWithID:docID revisionID:revID]];
}

- (id)getRevisionHistory:(id)args {
    TDRevisionProxy * revisionProxy;
    ENSURE_ARG_AT_INDEX(revisionProxy, args, 0, TDRevisionProxy);
    
    if (!revisionProxy) return nil;
    return [TDDatabaseProxy toRevisionProxyArray:[self.database getRevisionHistory:revisionProxy.revision]];
}


#pragma mark Views and Queries

- (id)getAllDocs:(id)args {
    NSDictionary * queryOptionsDict;
    ENSURE_ARG_OR_NIL_AT_INDEX(queryOptionsDict, args, 0, NSDictionary);
    
    TDQueryOptions queryOptions = kDefaultTDQueryOptions;
    [TDDatabaseProxy populateQueryOptions:&queryOptions fromDict:queryOptionsDict];
    return [self.database getAllDocs:&queryOptions];
}

- (id)getDocsWithIDs:(id)args {
    NSArray * docIDs;
    NSDictionary * queryOptionsDict;
    ENSURE_ARG_AT_INDEX(docIDs, args, 0, NSArray);
    ENSURE_ARG_OR_NIL_AT_INDEX(queryOptionsDict, args, 1, NSDictionary);
    
    TDQueryOptions queryOptions = kDefaultTDQueryOptions;
    [TDDatabaseProxy populateQueryOptions:&queryOptions fromDict:queryOptionsDict];
    return [self.database getAllDocs:&queryOptions];
}

- (id)viewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    TDView * result = [self.database viewNamed:name];
    /*
    if (!result || !result.mapBlock) {
        // compile view and set map block
        NSArray * viewName = [name pathComponents];
        NSAssert([viewName count] == 2, @"Invalid view path: %@", name);
        
        // get the design doc
        NSString * path = [NSString pathWithComponents:[NSArray arrayWithObjects:@"_design", [viewName objectAtIndex:0], nil]];
        TDRevision * ddoc = [result.database getDocumentWithID:path revisionID:nil options:nil];
        if (!ddoc) return nil;
        
        // get the view from the views property of the design doc
        NSDictionary * views = [ddoc.properties objectForKey:@"views"];
        NSDictionary * view = [views objectForKey:[viewName objectAtIndex:1]];
        if (!view) return nil;
        
        result = [self compileView:name fromProperties:view];
        if (!result) return nil; // TODO error callback?
    }
    */
    return [[[TDViewProxy alloc] initWithTDView:result] autorelease];
}


#pragma mark Bulk Documents

// TODO!




@end
