/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDViewProxy.h"
#import "TDDatabaseProxy.h"

@implementation TDViewProxy

@synthesize view;

#pragma mark Lifecycle

- (id)initWithTDView:(TDView *)aView {
    if (self = [super init]) {
        self.view = aView;
    }
    return self;
}

- (void)compileViewFromProperties:(NSDictionary *)viewProps {
    NSString * language = [viewProps objectForKey:@"language"] ?: @"javascript";
    
    NSString * mapSource = [viewProps objectForKey:@"map"];
    if (!mapSource)
        return; // TODO error
    
    TDMapBlock mapBlock = [[TDView compiler] compileMapFunction:mapSource language:language];
    if (!mapBlock) {
        NSLog(@"[WARNING] View %@ has unknown map function: %@", self.view.name, mapSource);
        return nil;
    }
    
    NSString * reduceSource = [viewProps objectForKey:@"reduce"];
    TDReduceBlock reduceBlock = NULL;
    if (reduceSource) {
        reduceBlock = [[TDView compiler] compileReduceFunction:reduceSource language:language];
        if (!reduceBlock) {
            NSLog(@"[WARNING] View %@ has unknown reduce function: %@", self.view.name, reduceSource);
            return; // TODO error
        }
    }
    
    [self.view setMapBlock:mapBlock reduceBlock:reduceBlock version:@"1"];
    
    /*
    NSDictionary* options = $castIf(NSDictionary, [viewProps objectForKey: @"options"]);
    if ($equal([options objectForKey: @"collation"], @"raw"))
        view.collation = kTDViewCollationRaw;
    */
}

- (void)prepareView {
    if (!self.view.mapBlock) {
        // compile view and set map block
        NSArray * viewName = [self.view.name pathComponents];
        NSAssert([viewName count] == 2, @"Invalid view path: %@", self.view.name);
        
        if (!self.view.database) {
            NSLog(@"missing database in view, exiting");
            return;
        }
        
        // get the design doc
        NSString * path = [NSString pathWithComponents:[NSArray arrayWithObjects:@"_design", [viewName objectAtIndex:0], nil]];
        TDRevision * ddoc = [self.view.database getDocumentWithID:path revisionID:nil options:0];        
        if (!ddoc) {
            NSLog(@"[WARNING] missing design doc %@", path);
            return;
        }
        
        // get the view from the views property of the design doc
        NSDictionary * views = [ddoc.properties objectForKey:@"views"];
        NSDictionary * viewdoc = [views objectForKey:[viewName objectAtIndex:1]];
        if (!viewdoc) {
            NSLog(@"[WARNING] design doc %@ has no property named 'views'", path);
            return; // TODO error?   
        }
        
        [self compileViewFromProperties:viewdoc];
    }
}


#pragma mark -
#pragma mark TDView

- (void)deleteView:(id)args {
    [self.view deleteView];
}

- (id)name {
    return self.view.name;
}

- (id)stale {
    return [NSNumber numberWithBool:self.view.stale];
}

- (id)lastSequenceIndexed {
    return [NSNumber numberWithLong:self.view.lastSequenceIndexed];
}

- (id)updateIndex:(id)args {
    [self prepareView];
    return [NSNumber numberWithInt:[self.view updateIndex]];
}

- (id)queryWithOptions:(id)args {
    NSDictionary * queryOptionsDict;
    ENSURE_ARG_OR_NULL_AT_INDEX(queryOptionsDict, args, 0, NSDictionary);
    
    TDStatus status;
    TDQueryOptions queryOptions = kDefaultTDQueryOptions;
    
    [TDDatabaseProxy populateQueryOptions:&queryOptions fromDict:queryOptionsDict];
    [self updateIndex:nil];
    
    NSArray * docs = [self.view queryWithOptions:&queryOptions status:&status];
    // TODO total_rows, offset, 
    return [NSDictionary dictionaryWithObjectsAndKeys:docs, @"rows", nil];
}

@end
