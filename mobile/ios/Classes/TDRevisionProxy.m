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
@property (nonatomic, strong) TDRevision * revision;
@end

@implementation TDRevisionProxyBase

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
    return [self.revision.properties objectForKey:key];
}

- (id)attachmentNames {
    return self.revision.attachmentNames;
}

- (id)attachmentNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    
    TDAttachment * attachment = [self.revision attachmentNamed:name];
    return attachment ? [[TDAttachmentProxy alloc] initWithTDAttachment:attachment] : nil;
}

- (id)attachments {
    NSMutableArray * result = [NSMutableArray array];
    for (TDAttachment * att in self.revision.attachments) {
        [result addObject:[[TDAttachmentProxy alloc] initWithTDAttachment:att]];
    }
    return result;
}

@end


@implementation TDRevisionProxy

- (id)initWithTDRevision:(TDRevision *)revision {
    if (self = [super init]) {
        self.revision = revision;
    }
    return self;
}

- (id)propertiesAreLoaded {
    return NUMBOOL(self.revision.propertiesAreLoaded);
}

- (id)newRevision:(id)args {
    TDNewRevision * rev = [self.revision newRevision];
    return rev ? [[TDNewRevisionProxy alloc] initWithTDNewRevision:rev] : nil;
}

- (id)putProperties:(id)args {
    NSDictionary * props;
    ENSURE_ARG_AT_INDEX(props, args, 0, NSDictionary)
    
    NSError * error = nil;
    TDRevision * rev = [self.revision putProperties:props error:&error];
    return error ? [self errorDict:error] : [[TDRevisionProxy alloc] initWithTDRevision:rev];
}

- (id)deleteDocument:(id)args {
    NSError * error;
    TDRevision * rev = [self.revision deleteDocument:&error];
    return error ? [self errorDict:error] : [[TDRevisionProxy alloc] initWithTDRevision:rev];
}

@end

@interface TDNewRevisionProxy ()
@property (nonatomic, strong) TDNewRevision * revision;
@end

@implementation TDNewRevisionProxy

- (id)initWithTDNewRevision:(TDNewRevision *)revision {
    if (self = [super init]) {
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
    TDRevision * rev = self.revision.parentRevision;
    return rev ? [[TDRevisionProxy alloc] initWithTDRevision:rev] : nil;
}

- (id)parentRevisionID {
    return self.revision.parentRevisionID;
}

- (id)save:(id)args {
    NSError * error = nil;
    TDRevision * rev = [self.revision save:&error];
    return error ? [self errorDict:error] : [[TDRevisionProxy alloc] initWithTDRevision:rev];
}

- (void)addAttachment:(id)args {
    NSString * name;
    NSString * contentType;
    TiBlob * content;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(contentType, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(content, args, 0, TiBlob)
    
    TDAttachment * attachment = [[TDAttachment alloc] initWithContentType:contentType body:content.data];
    [self.revision addAttachment:attachment named:name];
}

- (void)removeAttachment:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)

    [self.revision removeAttachmentNamed:name];
}

@end