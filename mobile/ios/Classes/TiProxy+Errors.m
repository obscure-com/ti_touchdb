//
//  TiProxy+Errors.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy+Errors.h"

@implementation TiProxy (Errors)

- (NSDictionary *)errorDict:(NSError *)error {
    return error ? [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithInteger:error.code], @"code", error.description, @"description", error.domain, @"domain", nil] : nil;
}

@end
