//
//  CouchDesignDocumentProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDesignDocumentProxy.h"
#import "CouchQueryProxy.h"
#import <CouchCocoa/CouchDesignDocument.h>
#import <CouchCocoa/RESTOperation.h>

@implementation CouchDesignDocumentProxy

@synthesize designDocument;

- (id)initWithCouchDesignDocument:(CouchDesignDocument *)ddoc {
    if (self = [super init]) {
        self.designDocument = ddoc;
    }
    return self;
}

+ (CouchDesignDocumentProxy *)proxyWith:(CouchDesignDocument *)ddoc {
    return ddoc ? [[[CouchDesignDocumentProxy alloc] initWithCouchDesignDocument:ddoc] autorelease] : nil;
}

#pragma mark PROPERTIES

- (id)language {
    return self.designDocument.language;
}

- (void)setLanguage:(id)val {
    self.designDocument.language = val;
}

- (id)viewNames {
    return self.designDocument.viewNames;
}

- (id)validation {
    return self.designDocument.validation;
}

- (void)setValidation:(id)val {
    self.designDocument.validation = val;
}

- (id)includeLocalSequence {
    return [NSNumber numberWithBool:self.designDocument.includeLocalSequence];
}

- (void)setIncludeLocalSequence:(id)val {
    self.designDocument.includeLocalSequence = [val boolValue];
}

- (id)changed {
    return [NSNumber numberWithBool:self.designDocument.changed];
}

#pragma mark METHODS

- (id)queryViewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    return [CouchQueryProxy proxyWith:[self.designDocument queryViewNamed:name]];
}

- (id)isLanguageAvailable:(id)args {
    NSString * lang;
    ENSURE_ARG_AT_INDEX(lang, args, 0, NSString)
    
    return [NSNumber numberWithBool:[self.designDocument isLanguageAvailable:lang]];
}

- (id)mapFunctionOfViewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    return [self.designDocument mapFunctionOfViewNamed:name];
}

- (id)reduceFunctionOfViewNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    return [self.designDocument reduceFunctionOfViewNamed:name];
}

- (void)defineView:(id)args {
    NSString * name;
    NSString * mapFunction;
    NSString * reduceFunction;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(mapFunction, args, 1, NSString)
    ENSURE_ARG_OR_NIL_AT_INDEX(reduceFunction, args, 2, NSString)
    
    [self.designDocument defineViewNamed:name map:mapFunction reduce:reduceFunction];
}

- (void)saveChanges:(id)args {
    RESTOperation * op = [self.designDocument saveChanges];
    if (![op wait]) {
        NSAssert(!op.error, @"Error calling saveChanges: %@", op.error);
    }
}

@end
