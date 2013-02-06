//
//  ViewCompiler.h
//  krollific
//
//  Created by Paul Mietz Egli on 7/16/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ViewCompiler : NSObject <CBLViewCompiler>
- (CBLValidationBlock) compileValidationFunction:(NSString *)validationSource language:(NSString *)language database:(CBLDatabase *)db;
- (CBLFilterBlock) compileFilterFunction:(NSString *)filterSource language:(NSString *)language database:(CBLDatabase *)db;
@end
