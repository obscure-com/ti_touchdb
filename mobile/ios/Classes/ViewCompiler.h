//
//  ViewCompiler.h
//  krollific
//
//  Created by Paul Mietz Egli on 7/16/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <TouchDB/TDDatabase+Insertion.h>
#import <TouchDB/TDView.h>

@interface ViewCompiler : NSObject <TDViewCompiler>
- (TDValidationBlock) compileValidationFunction:(NSString *)validationSource language:(NSString *)language database:(TDDatabase *)db;
@end
