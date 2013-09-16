//
//  TDDatabaseManagerProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDatabaseManagerProxy.h"
#import "CBLManager.h"
#import "TiProxy+Errors.h"
#import "TDDatabaseProxy.h"

#define kCBLDatabaseCreationError 100

@interface TDDatabaseManagerProxy ()
@property (nonatomic, strong) CBLManager * databaseManager;
@property (nonatomic, strong) NSMutableDictionary * databaseProxyCache;
@end

@implementation TDDatabaseManagerProxy

{
    NSError * lastError;
}

- (id)initWithExecutionContext:(id<TiEvaluator>)context {
    if (self = [super _initWithPageContext:context]) {
        TiThreadPerformOnMainThread(^{
            self.databaseManager = [CBLManager sharedInstance];
        }, YES);
        self.databaseProxyCache = [NSMutableDictionary dictionary];
        lastError = nil;
    }
    return self;
}

- (void)dealloc {
    RELEASE_TO_NIL(lastError)
    [super dealloc];
}

#pragma mark Public API

/**
 Returns the database with the given name, or nil if it doesn't exist.
 Multiple calls with the same name will return the same TDDatabaseProxy instance.
 */
- (id)databaseNamed:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    RELEASE_TO_NIL(lastError)

    TDDatabaseProxy * result = nil;
    result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        CBLDatabase * db = [self.databaseManager databaseNamed:name error:nil];
        if (db) {
            result = [[TDDatabaseProxy alloc] initWithExecutionContext:[self executionContext] CBLDatabase:db];
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

    RELEASE_TO_NIL(lastError)

    TDDatabaseProxy * result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        CBLDatabase * db = [self.databaseManager createDatabaseNamed:name error:&lastError];
        if (!db) {
            lastError = [NSError errorWithDomain:@"TouchDB" code:kCBLDatabaseCreationError userInfo:[NSDictionary dictionaryWithObject:[NSString stringWithFormat:@"could not create database '%@'", name] forKey:NSLocalizedDescriptionKey]];
            [lastError retain];
            return nil;
        }
        
        result = [[TDDatabaseProxy alloc] initWithExecutionContext:[self executionContext] CBLDatabase:db];
        [self.databaseProxyCache setObject:result forKey:name];
    }
    return result;
}

/** Replaces or installs a database from a file.
 This is primarily used to install a canned database on first launch of an app, in which case you should first check .exists to avoid replacing the database if it exists already. The canned database would have been copied into your app bundle at build time.
 @return  YES if the database was copied, NO if an error occurred. */
- (id)installDatabase:(id)args {
    NSString * name;
    NSString * pathToDatabase;
    NSString * pathToAttachments;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(pathToDatabase, args, 1, NSString)
    ENSURE_ARG_AT_INDEX(pathToAttachments, args, 2, NSString)
    
    RELEASE_TO_NIL(lastError)
    
    BOOL result = [self.databaseManager replaceDatabaseNamed:name withDatabaseFile:pathToDatabase withAttachments:pathToAttachments error:&lastError];
    [lastError retain];
    
    return NUMBOOL(result);
}

/**
 An array of the names of all existing databases.
 */
- (NSArray *)allDatabaseNames {
    RELEASE_TO_NIL(lastError)

    NSArray * result = self.databaseManager.allDatabaseNames;
    return result ? result : [NSArray array];
}

/**
 * internal server URL
 */
- (id)internalURL {
    return self.databaseManager.internalURL;
}

- (id)error {
    return lastError ? [self errorDict:lastError] : nil;
}

@end
