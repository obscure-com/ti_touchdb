/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */


#import "TiProxy.h"
#import <TouchDB/TDDatabase.h>

@interface TDDatabaseProxy : TiProxy

@property (nonatomic, strong) TDDatabase * database;

- (id)initWithTDDatabase:(TDDatabase *)db;

@end
