/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TiProxy.h"
#import <TouchDB/TDView.h>

@interface TDViewProxy : TiProxy
@property (nonatomic, strong) TDView * view;
- (id)initWithTDView:(TDView *)aView;
@end
