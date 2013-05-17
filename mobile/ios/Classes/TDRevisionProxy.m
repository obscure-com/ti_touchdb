//
//  TDRevisionProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDRevisionProxy.h"
#import "TiProxy+Errors.h"
#import "TiBlob.h"
#import "TDAttachmentProxy.h"

@interface TDRevisionProxyBase ()
{
    @package
    NSError * lastError;
}
@property (nonatomic, strong) CBLRevision * revision;
@end

@implementation TDRevisionProxyBase

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [super dealloc];
}

- (id)isDeleted {
    return NUMBOOL(self.revision.isDeleted);
}

- (id)revisionID {
    return self.revision.revisionID;
}

- (id)properties {
    return self.revision.properties;
}

- (id)userProperties {
    return self.revision.userProperties;
}

- (id)propertyForKey:(id)args {
    NSString * key;
    ENSURE_ARG_AT_INDEX(key, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)
    
    return [self.revision.properties objectForKey:key];
}

- (id)attachmentNames {
    NSArray * result = self.revision.attachmentNames;
    return result ? result : [NSArray array];
}

- (id)attachmentNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)
    
    CBLAttachment * attachment = [self.revision attachmentNamed:name];
    return attachment ? [[TDAttachmentProxy alloc] initWithExecutionContext:[self executionContext] CBLAttachment:attachment] : nil;
}

- (id)attachments {
    NSMutableArray * result = [NSMutableArray array];
    for (CBLAttachment * att in self.revision.attachments) {
        [result addObject:[[TDAttachmentProxy alloc] initWithExecutionContext:[self executionContext] CBLAttachment:att]];
    }
    return result;
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

@end


@implementation TDRevisionProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLRevision:(CBLRevision *)revision {
    if (self = [super _initWithPageContext:context]) {
        self.revision = revision;
    }
    return self;
}

- (id)propertiesAreLoaded {
    return NUMBOOL(self.revision.propertiesAreLoaded);
}

- (id)newRevision:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLNewRevision * rev = [self.revision newRevision];
    return rev ? [[CBLNewRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLNewRevision:rev] : nil;
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RELEASE_TO_NIL(lastError)
    
    CBLRevision * rev = [self.revision putProperties:props error:&lastError];
    [lastError retain];
    
    return rev ? [[TDRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLRevision:rev] : nil;
}

- (id)deleteDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLRevision * rev = [self.revision deleteDocument:&lastError];
    [lastError retain];
    
    return rev ? [[TDRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLRevision:rev] : nil;
}

@end

@interface CBLNewRevisionProxy ()
@property (nonatomic, strong) CBLNewRevision * revision;
@end

@implementation CBLNewRevisionProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLNewRevision:(CBLNewRevision *)revision {
    if (self = [super _initWithPageContext:context]) {
        self.revision = revision;
    }
    return self;
}

- (void)setIsDeleted:(id)arg {
    self.revision.isDeleted = [arg boolValue];
}

- (void)setProperties:(id)arg {
    self.revision.properties = arg;
}

- (id)parentRevision {
    CBLRevision * rev = self.revision.parentRevision;
    return rev ? [[TDRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLRevision:rev] : nil;
}

- (id)parentRevisionID {
    return self.revision.parentRevisionID;
}

- (void)setPropertyForKey:(id)args {
    NSString * name;
    NSObject * value;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_OR_NULL_AT_INDEX(value, args, 1, NSObject)
    
    self.revision[name] = value;
}

- (id)save:(id)args {
    RELEASE_TO_NIL(lastError)

    CBLRevision * rev = [self.revision save:&lastError];
    [lastError retain];
    
    return rev ? [[TDRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLRevision:rev] : nil;
}

- (void)addAttachment:(id)args {
    NSString * name;
    NSString * contentType;
    TiBlob * content;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(contentType, args, 1, NSString)
    ENSURE_ARG_AT_INDEX(content, args, 2, TiBlob)
    
    RELEASE_TO_NIL(lastError)

    CBLAttachment * attachment = [[CBLAttachment alloc] initWithContentType:contentType body:content.data];
    [self.revision addAttachment:attachment named:name];
}

- (void)removeAttachment:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)

    RELEASE_TO_NIL(lastError)

    [self.revision removeAttachmentNamed:name];
}

@end