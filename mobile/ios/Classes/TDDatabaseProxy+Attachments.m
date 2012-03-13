/**
 * $Id$
 * 
 * Copyright (c) 2012 Paul Mietz Egli
 * Licensed under the Apache Public License version 2.
 */

#import "TDDatabaseProxy+Attachments.h"
#import <TouchDB/TDDatabase+Attachments.h>
#import "TiBlob.h"

@implementation TDDatabaseProxy (Attachments)

- (id)updateAttachment:(id)args {
    NSString * attachmentName;
    TiBlob * blob;
    NSString * contentType;
    NSString * docID;
    NSString * revID;
    
    ENSURE_ARG_AT_INDEX(attachmentName, args, 0, NSString);
    ENSURE_ARG_AT_INDEX(blob, args, 1, TiBlob);
    ENSURE_ARG_AT_INDEX(contentType, args, 2, NSString);
    ENSURE_ARG_AT_INDEX(docID, args, 3, NSString);
    ENSURE_ARG_AT_INDEX(revID, args, 4, NSString);
    
    TDStatus status;
    
    [self.database updateAttachment:attachmentName body:blob.data type:contentType encoding:kTDAttachmentEncodingNone ofDocID:docID revID:revID status:&status];
    return [NSNumber numberWithInt:status];
}


- (id)getAttachmentForSequence:(id)args {
    NSNumber * sequence;
    NSString * filename;
    
    ENSURE_ARG_AT_INDEX(sequence, args, 0, NSNumber);
    ENSURE_ARG_AT_INDEX(filename, args, 0, NSString);
    
    TDStatus status;
    NSString * contentType;
    
    NSData * attachment = [self.database getAttachmentForSequence:[sequence longValue] named:filename type:&contentType encoding:nil status:&status];
    if (!attachment) return nil;
    
    return [[[TiBlob alloc] initWithData:attachment mimetype:contentType] autorelease];
}

@end
