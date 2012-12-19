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
    NSMutableDictionary * result = nil;
    if (error) {
        result = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                  NUMBOOL(YES), @"error",
                  NUMINT(error.code), @"code",
                  error.domain, @"domain",
                  error.localizedDescription, @"description",
                  nil];
        if (error.userInfo) {
            [result setObject:error.userInfo forKey:@"userInfo"];
        }
    }
    else {
        result = [NSMutableDictionary dictionaryWithObject:NUMBOOL(NO) forKey:@"error"];
    }
    return result;
}

@end
