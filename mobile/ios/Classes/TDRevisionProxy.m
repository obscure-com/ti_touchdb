//
//  TDRevisionProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 3/12/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TDRevisionProxy.h"

@implementation TDRevisionProxy

@synthesize revision;

#pragma mark -
#pragma mark Lifecycle

- (id)initWithTDRevision:(TDRevision *)rev {
    if (self = [super init]) {
        self.revision = rev;
    }
    return self;
}

#pragma mark -
#pragma mark TDRevision

- (id)docID {
    return self.revision.docID;
}

- (id)revID {
    return self.revision.revID;
}

- (id)deleted {
    return [NSNumber numberWithBool:self.revision.deleted];
}

- (id)properties {
    return self.revision.properties;
}

- (id)sequence {
    return [NSNumber numberWithLong:self.revision.sequence];
}


@end
