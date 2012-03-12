/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */


#import "TiProxy.h"
#import <TouchDB/TDDatabase.h>
#import <TouchDB/TDView.h>

@interface TDDatabaseProxy : TiProxy

@property (nonatomic, strong) TDDatabase * database;

+ (void)dispatchCallback:(KrollCallback *)cb forError:(NSError *)err;
+ (NSArray *)toRevisionProxyArray:(NSArray *)revs;
+ (NSDictionary *)toDocumentDictionary:(NSDictionary *)dict;
+ (void)populateQueryOptions:(TDQueryOptions *)options fromDict:(NSDictionary *)dict;

- (id)initWithTDDatabase:(TDDatabase *)db;

@end
