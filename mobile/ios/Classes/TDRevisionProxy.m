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

- (id)isDeletion {
    return NUMBOOL(self.revision.isDeletion);
}

- (id)isGone {
    return NUMBOOL(self.revision.isGone);
}

- (id)revisionID {
    return self.revision.revisionID;
}

- (id)parentRevision {
    CBLSavedRevision * rev = self.revision.parentRevision;
    return rev ? [[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev] : nil;
}

- (id)parentRevisionID {
    return self.revision.parentRevisionID;
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

- (id)getRevisionHistory:(id)args {
    RELEASE_TO_NIL(lastError)
    
    NSArray * revs = [self.revision getRevisionHistory:&lastError];
    [lastError retain];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLSavedRevision * rev in revs) {
        [result addObject:[[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev]];
    }
    return result;
}

- (id)attachmentNames {
    NSArray * result = self.revision.attachmentNames;
    return result ? result : [NSArray array];
}

- (id)getAttachment:(id)args {
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


@interface TDSavedRevisionProxy ()
@property (nonatomic, strong) CBLSavedRevision * revision;
@end

@implementation TDSavedRevisionProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLSavedRevision:(CBLSavedRevision *)revision {
    if (self = [super _initWithPageContext:context]) {
        self.revision = revision;
    }
    return self;
}

- (id)propertiesAvailable {
    return NUMBOOL([self.revision propertiesAvailable]);
}

- (id)createRevision:(id)args {
    RELEASE_TO_NIL(lastError)
    
    NSDictionary * props;
    ENSURE_ARG_OR_NIL_AT_INDEX(props, args, 0, NSDictionary)
    
    if (props) {
        CBLSavedRevision * rev = [self.revision createRevisionWithProperties:props error:&lastError];
        [lastError retain];

        return rev ? [[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev] : nil;
    }
    else {
        CBLUnsavedRevision * rev = [self.revision createRevision];
        return [[TDUnsavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLUnsavedRevision:rev];
    }

    return nil;
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RELEASE_TO_NIL(lastError)
    
    CBLSavedRevision * rev = [self.revision createRevisionWithProperties:props error:&lastError];
    [lastError retain];
    
    return rev ? [[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev] : nil;
}

- (id)deleteDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLSavedRevision * rev = [self.revision deleteDocument:&lastError];
    [lastError retain];
    
    return rev ? [[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev] : nil;
}

@end

@interface TDUnsavedRevisionProxy ()
@property (nonatomic, strong) CBLUnsavedRevision * revision;
@end

@implementation TDUnsavedRevisionProxy

- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLUnsavedRevision:(CBLUnsavedRevision *)revision {
    if (self = [super _initWithPageContext:context]) {
        self.revision = revision;
    }
    return self;
}

- (void)setIsDeletion:(id)arg {
    self.revision.isDeletion = [arg boolValue];
}

- (void)setProperties:(id)arg {
    self.revision.properties = arg;
}

- (void)setUserProperties:(id)arg {
    self.revision.userProperties = arg;
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

    CBLSavedRevision * rev = [self.revision save:&lastError];
    [lastError retain];
    
    return rev ? [[TDSavedRevisionProxy alloc] initWithExecutionContext:[self executionContext] CBLSavedRevision:rev] : nil;
}

- (void)setAttachment:(id)args {
    NSString * name;
    NSString * contentType;
    TiBlob * content;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(contentType, args, 1, NSString)
    ENSURE_ARG_AT_INDEX(content, args, 2, TiBlob)
    
    RELEASE_TO_NIL(lastError)

    [self.revision setAttachmentNamed:name withContentType:contentType content:content.data];
}

- (void)removeAttachment:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)

    RELEASE_TO_NIL(lastError)

    [self.revision removeAttachmentNamed:name];
}

@end