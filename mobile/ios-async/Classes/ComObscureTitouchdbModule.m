#import "ComObscureTitouchdbModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"


@interface ComObscureTitouchdbModule ()
@property (nonatomic, strong) TDServer * server;
@property (nonatomic, strong) TDListener * listener;
- (void)initializeTouchDB;
- (void)shutdownTouchDB;
@end

@implementation ComObscureTitouchdbModule

@synthesize server, listener;

#pragma mark Internal

- (id)moduleGUID {
	return @"238faad0-4532-4f36-bb59-ae25f480bbb8";
}

- (NSString*)moduleId {
	return @"com.obscure.titouchdb";
}

#pragma mark Lifecycle

-(void)startup {
	[super startup];
    
    [self initializeTouchDB];
	
	NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender {
    [self shutdownTouchDB];
	[super shutdown:sender];
}

- (void)dealloc {
	[super dealloc];
}

#pragma mark TDServer/TDListener

- (void)initializeTouchDB {
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES);
    NSString* path = [paths objectAtIndex:0];
    path = [path stringByAppendingPathComponent: [[NSBundle mainBundle] bundleIdentifier]];
    path = [path stringByAppendingPathComponent: @"TouchDB"];
    NSLog(@"Creating TDServer at %@", path);
    NSError* error = nil;
    if ([[NSFileManager defaultManager] createDirectoryAtPath:path
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:&error]) {
        self.server = [[TDServer alloc] initWithDirectory:path error:&error];
    }
    
    if (self.server) {
        [TDURLProtocol setServer:self.server];
//        [TDView setCompiler:self];
    }
    else
        NSLog(@"Error creating server: %@", error);
}

- (void)shutdownTouchDB {
    [self.listener stop];
}

#pragma mark -
#pragma mark Public API

- (id)startServer:(id)args {
    KrollCallback * callback;
    ENSURE_ARG_OR_NIL_AT_INDEX(callback, args, 0, KrollCallback)
    
    self.listener = [[TDListener alloc] initWithTDServer:self.server port:0];
    BOOL started = [self.listener start];
    
    NSDictionary * e = [NSDictionary dictionaryWithObjectsAndKeys:NUMBOOL(started), @"started", NUMINT(self.listener.port), @"port", nil];
    
    [callback call:[NSArray arrayWithObject:e] thisObject:nil];
}

@end
