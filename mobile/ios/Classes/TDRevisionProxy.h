//
//  TDRevisionProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 3/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy.h"
#import <TouchDB/TDRevision.h>

@interface TDRevisionProxy : TiProxy
@property (nonatomic, strong) TDRevision * revision;
- (id)initWithTDRevision:(TDRevision *)rev;
@end
