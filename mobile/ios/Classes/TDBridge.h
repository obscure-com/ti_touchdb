//
//  TDBridge.h
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import <Foundation/Foundation.h>
#import "TouchDB.h"

@class KrollCallback;

@interface TDBridge : NSObject
+ (TDBridge *)sharedInstance;
- (TDMapBlock)mapBlockForCallback:(KrollCallback *)callback;
- (TDReduceBlock)reduceBlockForCallback:(KrollCallback *)callback;
- (TDValidationBlock)validationBlockForCallback:(KrollCallback *)callback;
- (TDFilterBlock)filterBlockForCallback:(KrollCallback *)callback;
@end
