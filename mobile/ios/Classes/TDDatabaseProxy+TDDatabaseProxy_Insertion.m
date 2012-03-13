/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDDatabaseProxy+TDDatabaseProxy_Insertion.h"
#import "TDRevisionProxy.h"
#import <TouchDB/TDDatabase+Insertion.h>

@implementation TDDatabaseProxy (Insertion)

#pragma mark Proxy Helpers

- (id)createRevision:(id)args {
    NSDictionary * properties;
    ENSURE_ARG_AT_INDEX(properties, args, 0, NSDictionary);
    
    TDRevision * revision = [TDRevision revisionWithProperties:properties];
    return [[[TDRevisionProxy alloc] initWithTDRevision:revision] autorelease];
}

#pragma mark -
#pragma mark TDDatabase+Insertion

- (id)isValidDocumentID:(id)args {
    NSString * str;
    ENSURE_ARG_AT_INDEX(str, args, 0, NSString);
    return [NSNumber numberWithBool:[TDDatabase isValidDocumentID:str]];
}

- (id)generateDocumentID:(id)args {
    return [TDDatabase generateDocumentID];
}

- (id)putRevision:(id)args {
    TDRevisionProxy * proxy;
    NSString * prevRevID;
    NSNumber * allowConflict;
    
    ENSURE_ARG_AT_INDEX(proxy, args, 0, TDRevisionProxy);
    ENSURE_ARG_OR_NULL_AT_INDEX(prevRevID, args, 1, NSString);
    ENSURE_ARG_OR_NULL_AT_INDEX(allowConflict, args, 2, NSNumber);
    
    TDStatus status;
    
    TDRevision * result = [self.database putRevision:proxy.revision prevRevisionID:prevRevID allowConflict:[allowConflict boolValue] status:&status];
    
    return [NSNumber numberWithInt:status];
}

#pragma mark -
#pragma mark Helper Methods

- (id)deleteRevision:(id)args {
    TDRevisionProxy * proxy;
    ENSURE_ARG_AT_INDEX(proxy, args, 0, TDRevisionProxy);
    
    if (!proxy || !proxy.revision) return [NSNumber numberWithInt:404];
    
    TDStatus status;
    [proxy.revision.properties setValue:[NSNumber numberWithBool:YES] forKey:@"_deleted"];
    [self.database putRevision:proxy.revision prevRevisionID:proxy.revision.revID allowConflict:YES status:&status];
    return [NSNumber numberWithInt:status];
}
              

@end
