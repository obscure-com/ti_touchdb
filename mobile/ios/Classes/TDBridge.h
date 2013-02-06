//
//  CBLBridge.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import <Foundation/Foundation.h>

@class KrollCallback;

@interface TDBridge : NSObject
+ (TDBridge *)sharedInstance;
- (CBLMapBlock)mapBlockForCallback:(KrollCallback *)callback;
- (CBLReduceBlock)reduceBlockForCallback:(KrollCallback *)callback;
- (CBLValidationBlock)validationBlockForCallback:(KrollCallback *)callback;
- (CBLFilterBlock)filterBlockForCallback:(KrollCallback *)callback;
@end
