/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TiProxy.h"
#import <TouchDB/TDRevision.h>

@interface TDRevisionProxy : TiProxy
@property (nonatomic, strong) TDRevision * revision;
- (id)initWithTDRevision:(TDRevision *)rev;
@end
