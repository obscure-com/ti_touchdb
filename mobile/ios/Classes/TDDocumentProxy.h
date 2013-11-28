//
//  TDDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "CouchbaseLite.h"

@class TDSavedRevisionProxy;

@interface TDDocumentProxy : TiProxy
- (id)initWithExecutionContext:(id<TiEvaluator>)context CBLDocument:(CBLDocument *)document;
@end
