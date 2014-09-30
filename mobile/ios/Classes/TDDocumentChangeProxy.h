//
//  TDDatabaseChangeProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 9/30/14.
//
//

#import "TiProxy.h"
#import "TDDatabaseProxy.h"
#import "TDDocumentProxy.h"

@interface TDDocumentChangeProxy : TiProxy
@property (nonatomic, copy) NSString * documentId;
@property (nonatomic, assign) BOOL isConflict;
@property (nonatomic, assign) BOOL isCurrentRevision;
@property (nonatomic, copy) NSString * revisionId;
@property (nonatomic, copy) NSString * sourceUrl;

+ (instancetype)proxyWithDatabase:(TDDatabaseProxy *)database documentChange:(CBLDatabaseChange *)change;
+ (instancetype)proxyWithDocument:(TDDocumentProxy *)document documentChange:(CBLDatabaseChange *)change;

/* note that CBL iOS calls a change a "database change" but the common API and Android
 refer to it as a document change, which is really what it represents */

@end
