//
//  TDRevisionProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDRevisionProxy.h"
#import "TDDocumentProxy.h"
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

- (id)database {
    return self.doc.db;
}

- (id)isDeletion {
    return NUMBOOL(self.revision.isDeletion);
}

- (id)revisionID {
    return self.revision.revisionID;
}

- (id)parent {
    CBLSavedRevision * rev = self.revision.parentRevision;
    return rev ? [TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev] : nil;
}

- (id)parentID {
    return self.revision.parentRevisionID;
}

- (id)properties {
    return self.revision.properties;
}

- (id)userProperties {
    return self.revision.userProperties;
}

- (id)getDocument:(id)args {
    return self.doc;
}

- (id)getProperty:(id)args {
    NSString * key;
    ENSURE_ARG_AT_INDEX(key, args, 0, NSString)
    
    RELEASE_TO_NIL(lastError)
    
    return [self.revision.properties objectForKey:key];
}

- (id)revisionHistory {
    RELEASE_TO_NIL(lastError)
    
    NSArray * revs = [self.revision getRevisionHistory:&lastError];
    [lastError retain];
    
    NSMutableArray * result = [NSMutableArray arrayWithCapacity:[revs count]];
    for (CBLSavedRevision * rev in revs) {
        [result addObject:[TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev]];
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
    return attachment ? [TDAttachmentProxy proxyWithRevision:self attachment:attachment] : nil;
}

- (id)attachments {
    NSMutableArray * result = [NSMutableArray array];
    for (CBLAttachment * att in self.revision.attachments) {
        [result addObject:[TDAttachmentProxy proxyWithRevision:self attachment:att]];
    }

    return result;
}

- (id)error {
    return [self errorDict:lastError];
}

@end


@interface TDSavedRevisionProxy ()
@end

@implementation TDSavedRevisionProxy

+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document savedRevision:(CBLSavedRevision *)revision {
    return [[[TDSavedRevisionProxy alloc] initWithDocument:document savedRevision:revision] autorelease];
}

- (id)initWithDocument:(TDDocumentProxy *)document savedRevision:(CBLSavedRevision *)revision {
    if (self = [super _initWithPageContext:document.pageContext]) {
        self.doc = document;
        self.revision = revision;
    }
    return self;
}

- (id)propertiesAvailable {
    return NUMBOOL([(CBLSavedRevision *)self.revision propertiesAvailable]);
}

- (id)createRevision:(id)args {
    RELEASE_TO_NIL(lastError)
    
    NSDictionary * props;
    ENSURE_ARG_OR_NIL_AT_INDEX(props, args, 0, NSDictionary)
    
    if (props) {
        CBLSavedRevision * rev = [(CBLSavedRevision *)self.revision createRevisionWithProperties:props error:&lastError];
        [lastError retain];

        return rev ? [TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev] : nil;
    }
    else {
        CBLUnsavedRevision * rev = [(CBLSavedRevision *)self.revision createRevision];
        return [TDUnsavedRevisionProxy proxyWithDocument:self.doc unsavedRevision:rev];
    }

    return [NSNull null];
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    RELEASE_TO_NIL(lastError)
    
    CBLSavedRevision * rev = [(CBLSavedRevision *)self.revision createRevisionWithProperties:props error:&lastError];
    [lastError retain];
    
    return rev ? [TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev] : nil;
}

- (id)deleteDocument:(id)args {
    RELEASE_TO_NIL(lastError)
    
    CBLSavedRevision * rev = [(CBLSavedRevision *)self.revision deleteDocument:&lastError];
    [lastError retain];
    
    return rev ? [TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev] : nil;
}

@end

@interface TDUnsavedRevisionProxy ()
@end

@implementation TDUnsavedRevisionProxy

+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document unsavedRevision:(CBLUnsavedRevision *)revision {
    return [[[TDUnsavedRevisionProxy alloc] initWithDocument:document unsavedRevision:revision] autorelease];
}


- (id)initWithDocument:(TDDocumentProxy *)document unsavedRevision:(CBLUnsavedRevision *)revision {
    if (self = [super _initWithPageContext:document.pageContext]) {
        self.doc = document;
        self.revision = revision;
    }
    return self;
}

- (void)setIsDeletion:(id)arg {
    ((CBLUnsavedRevision *)self.revision).isDeletion = [arg boolValue];
}

- (void)setProperties:(id)arg {
    ((CBLUnsavedRevision *)self.revision).properties = arg;
}

- (void)setUserProperties:(id)arg {
    ((CBLUnsavedRevision *)self.revision).userProperties = arg;
}

- (void)setPropertyForKey:(id)args {
    NSString * name;
    NSObject * value;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_OR_NULL_AT_INDEX(value, args, 1, NSObject)
    
    ((CBLUnsavedRevision *)self.revision)[name] = value;
}

- (id)save:(id)args {
    NSNumber * allowConflicts;
    ENSURE_ARG_OR_NULL_AT_INDEX(allowConflicts, args, 0, NSNumber)
    
    RELEASE_TO_NIL(lastError)

    CBLSavedRevision * rev = [allowConflicts boolValue] ? [(CBLUnsavedRevision *)self.revision saveAllowingConflict:&lastError] : [(CBLUnsavedRevision *)self.revision save:&lastError];
    [lastError retain];
    
    return rev ? [TDSavedRevisionProxy proxyWithDocument:self.doc savedRevision:rev] : nil;
}

- (void)setAttachment:(id)args {
    NSString * name;
    NSString * contentType;
    NSObject * content;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(contentType, args, 1, NSString)
    ENSURE_ARG_AT_INDEX(content, args, 2, NSObject)
    
    RELEASE_TO_NIL(lastError)

    if ([content isKindOfClass:[TiBlob class]]) {
        [(CBLUnsavedRevision *)self.revision setAttachmentNamed:name withContentType:contentType content:((TiBlob *)content).data];
    }
    else if ([content isKindOfClass:[NSString class]]) {
        NSURL * contentUrl = [NSURL URLWithString:(NSString *)content];
        [(CBLUnsavedRevision *)self.revision setAttachmentNamed:name withContentType:contentType contentURL:contentUrl];
    }
    else {
        // TODO type error?
    }
}

- (void)removeAttachment:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)

    RELEASE_TO_NIL(lastError)

    [(CBLUnsavedRevision *)self.revision removeAttachmentNamed:name];
}

@end