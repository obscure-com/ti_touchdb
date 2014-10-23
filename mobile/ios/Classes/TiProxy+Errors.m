//
//  TiProxy+Errors.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 4/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "TiProxy+Errors.h"

@implementation TiProxy (Errors)

- (id)errorDict:(NSError *)error {
    NSDictionary * result = nil;
    if (error) {
        result = @{
            @"error": NUMBOOL(YES),
            @"code": NUMLONG(error.code),
            @"domain": error.domain,
            @"description": error.localizedDescription
        };
        /*
        // who knows what evil lurks in the hearts of error.userInfo?
        // whatever it is, it can't be serialized to javascript...
        if (error.userInfo) {
            [result setObject:error.userInfo forKey:@"userInfo"];
        }
        */
    }
    return result ? result : [NSNull null];
}

@end
