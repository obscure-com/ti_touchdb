//
//  TDDatabaseManagerProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDatabaseManagerProxy.h"
#import "TDDatabaseManager.h"
#import "TiProxy+Errors.h"
#import "TDDatabaseProxy.h"

#define kTDDatabaseCreationError 100

@interface TDDatabaseManagerProxy ()
@property (nonatomic, strong) TDDatabaseManager * databaseManager;
@property (nonatomic, strong) NSMutableDictionary * databaseProxyCache;
@end

@implementation TDDatabaseManagerProxy

+ (TDDatabaseManagerProxy *)sharedInstance {
    static TDDatabaseManagerProxy * sInstance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sInstance = [[self alloc] init];
    });
    return sInstance;
}

- (id)init {
    if (self = [super init]) {
        self.databaseManager = [TDDatabaseManager sharedInstance];
        self.databaseProxyCache = [NSMutableDictionary dictionary];
    }
    return self;
}


#pragma mark Public API

/**
 Returns the database with the given name, or nil if it doesn't exist.
 Multiple calls with the same name will return the same TDDatabaseProxy instance.
 */
- (id)databaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    TDDatabaseProxy * result = nil;
    result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        TDDatabase * db = [self.databaseManager databaseNamed:name];
        if (db) {
            result = [[TDDatabaseProxy alloc] initWithTDDatabase:db];
            [self.databaseProxyCache setObject:result forKey:name];
        }
    }
    return result;
}

/**
 Returns the database with the given name, creating it if it didn't already exist.
 Multiple calls with the same name will return the same TDDatabaseProxy instance.
 NOTE: Database names may not contain capital letters!
 */
- (id)createDatabaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);

    TDDatabaseProxy * result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        NSError * error = nil;
        TDDatabase * db = [self.databaseManager createDatabaseNamed:name error:&error];
        
        if (!db) {
            error = [NSError errorWithDomain:@"TouchDB" code:kTDDatabaseCreationError userInfo:[NSDictionary dictionaryWithObject:[NSString stringWithFormat:@"could not create database '%@'", name] forKey:NSLocalizedDescriptionKey]];
        }
        
        if (error) {
            return [self errorDict:error];
        }
        else {
            result = [[TDDatabaseProxy alloc] initWithTDDatabase:db];
            [self.databaseProxyCache setObject:result forKey:name];
        }
    }
    return result;
}

/**
 An array of the names of all existing databases.
 */
- (NSArray *)allDatabaseNames {
    NSArray * result = self.databaseManager.allDatabaseNames;
    return result ? result : [NSArray array];
}

@end
