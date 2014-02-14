//
//  CBLBridge.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import <Foundation/Foundation.h>

@class KrollCallback;
@protocol TiEvaluator;
@class TDDatabaseProxy;

@interface TDBridge : NSObject
+ (TDBridge *)sharedInstance;
- (CBLMapBlock)mapBlockForCallback:(KrollCallback *)callback inExecutionContext:(id<TiEvaluator>)context;
- (CBLReduceBlock)reduceBlockForCallback:(KrollCallback *)callback inExecutionContext:(id<TiEvaluator>)context;
- (CBLValidationBlock)validationBlockInDatabase:(TDDatabaseProxy *)database forCallback:(KrollCallback *)callback;
- (CBLFilterBlock)filterBlockForCallback:(KrollCallback *)callback inExecutionContext:(id<TiEvaluator>)context;
@end
