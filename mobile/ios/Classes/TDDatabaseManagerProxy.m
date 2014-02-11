//
//  TDDatabaseManagerProxy.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 12/10/12.
//
//

#import "TDDatabaseManagerProxy.h"
#import "ComObscureTitouchdbModule.h"
#import "CBLManager.h"
#import "TiProxy+Errors.h"
#import "TDDatabaseProxy.h"

#define kCBLDatabaseCreationError 100

@interface TDDatabaseManagerProxy ()
@property (nonatomic, strong) CBLManager * databaseManager;
@property (nonatomic, strong) NSMutableDictionary * databaseProxyCache;
@property (nonatomic, strong) NSError * lastError;
@end

@implementation TDDatabaseManagerProxy

{
    dispatch_queue_t manager_queue;
}

+ (instancetype)proxyWithModule:(ComObscureTitouchdbModule *)module {
    return [[[TDDatabaseManagerProxy alloc] initWithExecutionContext:module.executionContext] autorelease];
}

- (id)initWithExecutionContext:(id<TiEvaluator>)context {
    if (self = [super _initWithPageContext:context]) {
        manager_queue = dispatch_queue_create("database_manager_queue", NULL);
        dispatch_sync(dispatch_get_main_queue(), ^{
            self.databaseManager = [CBLManager sharedInstance];
            self.databaseManager.dispatchQueue = manager_queue;
        });
        self.databaseProxyCache = [NSMutableDictionary dictionary];
        self.lastError = nil;
    }
    return self;
}

- (void)dealloc {
    self.lastError = nil;
    [super dealloc];
}

- (void)forgetDatabaseProxyNamed:(NSString *)name {
    [self.databaseProxyCache removeObjectForKey:name];
}

#pragma mark Public API

/** Returns YES if the given name is a valid database name.
 (Only the characters in "abcdefghijklmnopqrstuvwxyz0123456789_$()+-/" are allowed.) */
- (id)isValidDatabaseName:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);

    return NUMBOOL([CBLManager isValidDatabaseName:name]);
}

/** The default directory to use for a CBLManager. This is in the Application Support directory. */
- (id)defaultDirectory {
    return [CBLManager defaultDirectory];
}

/** The root directory of this manager (as specified at initialization time.) */
- (id)directory {
    return self.databaseManager.directory;
}

/**
 Returns the database with the given name, creating it if it didn't already exist.
 Multiple calls with the same name will return the same TDDatabaseProxy instance.
 */
- (id)getDatabase:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);
    
    self.lastError = nil;

    TDDatabaseProxy * result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        CBLDatabase * db = [self.databaseManager databaseNamed:name error:nil];
        if (db) {
            result = [TDDatabaseProxy proxyWithManager:self database:db];
            [self.databaseProxyCache setObject:result forKey:name];
        }
        else {
            self.lastError = [NSError errorWithDomain:@"TouchDB" code:kCBLDatabaseCreationError userInfo:[NSDictionary dictionaryWithObject:[NSString stringWithFormat:@"could not create database '%@'", name] forKey:NSLocalizedDescriptionKey]];
            return nil;
        }
    }
    return result;
}

/**
 Returns the database with the given name, or nil if it doesn't exist.
 Multiple calls with the same name will return the same TDDatabaseProxy instance.
 NOTE: Database names may not contain capital letters!
 */
- (id)getExistingDatabase:(id)args {
    NSString * name;
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString);

    self.lastError = nil;

    TDDatabaseProxy * result = [self.databaseProxyCache objectForKey:name];
    if (!result) {
        NSError * error = nil;
        CBLDatabase * db = [self.databaseManager existingDatabaseNamed:name error:&error];
        
        if (!db) {
            self.lastError = [NSError errorWithDomain:@"TouchDB" code:kCBLDatabaseCreationError userInfo:[NSDictionary dictionaryWithObject:[NSString stringWithFormat:@"could not find database '%@'", name] forKey:NSLocalizedDescriptionKey]];
            return nil;
        }
        
        result = [TDDatabaseProxy proxyWithManager:self database:db];
        [self.databaseProxyCache setObject:result forKey:name];
    }
    return result;
}

/** Replaces or installs a database from a file.
 This is primarily used to install a canned database on first launch of an app, in which case you should first check .exists to avoid replacing the database if it exists already. The canned database would have been copied into your app bundle at build time.
 @return  YES if the database was copied, NO if an error occurred. */
- (id)replaceDatabase:(id)args {
    NSString * name;
    NSString * pathToDatabase;
    NSString * pathToAttachments;
    
    ENSURE_ARG_AT_INDEX(name, args, 0, NSString)
    ENSURE_ARG_AT_INDEX(pathToDatabase, args, 1, NSString)
    ENSURE_ARG_AT_INDEX(pathToAttachments, args, 2, NSString)
    
    self.lastError = nil;

    NSError * error = nil;
    BOOL result = [self.databaseManager replaceDatabaseNamed:name withDatabaseFile:pathToDatabase withAttachments:pathToAttachments error:&error];
    self.lastError = error;
    
    if (result) {
        [self forgetDatabaseProxyNamed:name];
    }
    
    return NUMBOOL(result);
}

/**
 An array of the names of all existing databases.
 */
- (NSArray *)allDatabaseNames {
    self.lastError = nil;

    NSArray * result = self.databaseManager.allDatabaseNames;
    return result ? result : [NSArray array];
}

/**
 * internal server URL
 */
- (id)internalURL {
    return self.databaseManager.internalURL;
}

/** Releases all resources used by the CBLManager instance and closes all its databases. */
- (void)close:(id)args {
    [self.databaseManager close];
}

- (id)error {
    return self.lastError ? [self errorDict:self.lastError] : nil;
}

@end
