//
//  CouchDesignDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CouchDocumentProxy.h"

@class CouchDesignDocument;

@interface CouchDesignDocumentProxy : CouchDocumentProxy
@property (nonatomic, strong) CouchDesignDocument * designDocument;
+ (CouchDesignDocumentProxy *)proxyWith:(CouchDesignDocument *)ddoc;
@end
