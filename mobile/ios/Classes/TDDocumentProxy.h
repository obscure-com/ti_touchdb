//
//  TDDocumentProxy.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TiProxy.h"
#import "TouchDB.h"

@class TDRevisionProxy;

@interface TDDocumentProxy : TiProxy
- (id)initWithTDDocument:(TDDocument *)document;
@end
