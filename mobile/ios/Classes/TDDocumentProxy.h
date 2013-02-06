//
//  TDDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "CouchbaseLite.h"

@class TDRevisionProxy;

@interface TDDocumentProxy : TiProxy
- (id)initWithCBLDocument:(CBLDocument *)document;
@end
