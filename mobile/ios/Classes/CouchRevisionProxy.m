//
//  CouchRevisionProxy.m
//  ;
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchRevisionProxy.h"
#import "CouchAttachmentProxy.h"
#import "CouchDocumentProxy.h"
#import "TiProxy+Errors.h"
#import "TiMacroFixups.h"

@implementation CouchRevisionProxy

@synthesize revision;

- (id)initWithCouchRevision:(CouchRevision *)rev {
    if (self = [super init]) {
        self.revision = rev;
    }
    return self;
}

+ (CouchRevisionProxy *)proxyWith:(CouchRevision *)rev {
    return rev ? [[[CouchRevisionProxy alloc] initWithCouchRevision:rev] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)document {
    return [CouchDocumentProxy proxyWith:self.revision.document];
}

- (id)documentID {
    return self.revision.documentID;
}

- (id)revisionID {
    return self.revision.revisionID;
}

- (id)isCurrent {
    return [NSNumber numberWithBool:self.revision.isCurrent];
}

- (id)isDeleted {
    return [NSNumber numberWithBool:self.revision.isDeleted];
}

- (id)properties {
    return self.revision.properties;
}

- (id)userProperties {
    return self.revision.userProperties;
}

- (id)propertiesAreLoaded {
    return [NSNumber numberWithBool:self.revision.propertiesAreLoaded];    
}

- (id)attachmentNames {
    id result = self.revision.attachmentNames;
    return result ? result : [NSArray array];
}

#pragma mark METHODS

- (id)propertyForKey:(id)args {
    NSString * key;
    ENSURE_ARG_AT_INDEX(key, args, 0, NSString)
    
    return [self.revision propertyForKey:key];
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RESTOperation * op = [self.revision putProperties:props];
    if (![op wait]) {
        NSAssert(op.error.code == 412, @"Error putting document properties: %@", op.error);
    }

    // error/revision not being set on op
    // return op.error.code == 412 ? [self errorDict:op.error] : [CouchRevisionProxy proxyWith:[op resultObject]];
    return [NSNumber numberWithInt:op.httpStatus];
}

- (id)attachmentNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    return [CouchAttachmentProxy proxyWith:[self.revision attachmentNamed:name]];
}

- (id)createAttachment:(id)args {
    NSString * name;
    NSString * contentType;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_OR_NULL_AT_INDEX(contentType, args, 1, NSString)
    
    if (!contentType) contentType = @"application/octet-stream";
    return [CouchAttachmentProxy proxyWith:[self.revision createAttachmentWithName:name type:contentType]];
}

@end
