//
//  ViewCompiler.m
//  krollific
//
//  Created by Paul Mietz Egli on 7/16/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "ViewCompiler.h"
#import "TiCore.h"

#import "KrollBridge.h"
#import "KrollContext.h"
#import "KrollMethod.h"
#import "KrollObject.h"

@interface ViewCompiler ()
- (TiObjectRef)compile:(NSString *)source context:(TiContextRef)context;
- (void)bindCallback:(TiObjectCallAsFunctionCallback)fn name:(NSString*)name context:(TiContextRef)context;
@end


@implementation ViewCompiler

// forward declarations
TiStringRef kTiStringLength;
TiStringRef kTiStringGetTime;
TiStringRef kTiStringNewObject;
static id TiValueToId(TiContextRef jsContext, TiValueRef v);
static TiValueRef IdToTiValue(TiContextRef jsContext, id obj);

// private members
TiGlobalContextRef _context;
CBLMapEmitBlock _emitBlock;

#pragma mark Lifecycle

- (id)init {
    if (self = [super init]) {
        _context = TiGlobalContextCreate(NULL);
        TiGlobalContextRetain(_context);
        [self bindCallback:EmitCallback name:@"emit" context:_context];

        // bridge constants
        kTiStringGetTime = TiStringCreateWithUTF8CString("getTime");
        kTiStringLength = TiStringCreateWithUTF8CString("length");
		kTiStringNewObject = TiStringCreateWithUTF8CString("new Object()");
    }
    return self;
}

- (void)dealloc {
    TiGlobalContextRelease(_context);
    [super dealloc];
}

#pragma mark -
#pragma mark CBLViewCompiler

- (CBLMapBlock)compileMapFunction:(NSString*)mapSource language:(NSString*)language {
    if (![@"javascript" isEqualToString:language])
        return nil;

    CBLMapBlock result = nil;
    TiObjectRef fn = [self compile:mapSource context:_context];
    TiValueProtect(_context, fn);
    if (fn) {
        result = ^(NSDictionary* doc, CBLMapEmitBlock emit) {
            _emitBlock = emit;
            
            TiValueRef args[1];
            args[0] = IdToTiValue(_context, doc);
            
            TiValueRef exception = TiValueMakeUndefined(_context);
            TiObjectCallAsFunction(_context, fn, nil, 1, args, nil);
            if (TiValueGetType(_context, exception) != kTITypeUndefined) {
                NSLog(@"error in map function: %@", TiValueToId(_context, exception));
            }
        };
    }

    return [[result copy] autorelease];
}

- (CBLReduceBlock)compileReduceFunction:(NSString *)reduceSource language:(NSString *)language {
    if (![@"javascript" isEqualToString:language])
        return nil;
    
    CBLReduceBlock result = nil;
    TiObjectRef fn = [self compile:reduceSource context:_context];
    TiValueProtect(_context, fn);
    if (fn) {
        result = ^(NSArray * keys, NSArray * values, BOOL rereduce) {
            TiValueRef args[3];
            
            args[0] = IdToTiValue(_context, keys);
            args[1] = IdToTiValue(_context, values);
            args[2] = IdToTiValue(_context, NUMBOOL(rereduce));
            
            TiValueRef exception = TiValueMakeUndefined(_context);
            TiValueRef val = TiObjectCallAsFunction(_context, fn, nil, 3, args, &exception);
            
            id result = nil;
            if (TiValueGetType(_context, exception) != kTITypeUndefined) {
                NSLog(@"error in reduce function: %@", TiValueToId(_context, exception));
            }
            else {
                result = TiValueToId(_context, val);
            }
            return result;
        };
    }
    
    return [[result copy] autorelease];
}

#pragma mark -
#pragma mark CBLValidationBlock compiler

- (CBLValidationBlock)compileValidationFunction:(NSString *)validationSource language:(NSString *)language database:(CBLDatabase *)db {
    if (![@"javascript" isEqualToString:language])
        return nil;
    
    CBLValidationBlock result = nil;
    TiObjectRef fn = [self compile:validationSource context:_context];
    TiValueProtect(_context, fn);
    NSDictionary * userCtx = [NSDictionary dictionaryWithObjectsAndKeys:
                                      db.name, @"database",
                                      @"touchdb", @"name",
                                      [NSArray array], @"roles",
                                      nil];
    NSDictionary * secObj = [NSDictionary dictionary];
    
    if (fn && TiObjectIsFunction(_context, fn)) {
        result = ^(CBLRevision* newRevision, id<CBLValidationContext> context) {
            NSDictionary * oldDoc = [context currentRevision].properties;
            NSDictionary * newDoc = newRevision.properties;
            
            TiValueRef args[4];
            args[0] = IdToTiValue(_context, newDoc);
            args[1] = IdToTiValue(_context, oldDoc);
            args[2] = IdToTiValue(_context, userCtx);
            args[3] = IdToTiValue(_context, secObj);
            
            TiValueRef exception = TiValueMakeUndefined(_context);
            TiObjectCallAsFunction(_context, fn, nil, 4, args, &exception);
            
            TiType type = TiValueGetType(_context, exception);
            return (BOOL) (type == kTITypeUndefined);
        };
    }
    else {
        NSLog(@"could not compile validation function");
    }
    
    return [[result copy] autorelease];
}

#pragma mark -
#pragma mark CBLFilterBlock compiler

- (CBLFilterBlock) compileFilterFunction:(NSString *)filterSource language:(NSString *)language database:(CBLDatabase *)db {
    if (![@"javascript" isEqualToString:language])
        return nil;
    
    CBLFilterBlock result = nil;
    TiObjectRef fn = [self compile:filterSource context:_context];
    TiValueProtect(_context, fn);
    NSDictionary * userCtx = [NSDictionary dictionaryWithObjectsAndKeys:
                              db.name, @"database",
                              @"touchdb", @"name",
                              [NSArray array], @"roles",
                              nil];
    NSDictionary * secObj = [NSDictionary dictionary];
    
    if (fn && TiObjectIsFunction(_context, fn)) {
        result = ^(CBLRevision* revision, NSDictionary* params) {
            TiValueRef args[2];
            args[0] = IdToTiValue(_context, revision.properties);
            args[1] = IdToTiValue(_context, params);
            
            TiValueRef exception = TiValueMakeUndefined(_context);
            TiValueRef returnVal = TiObjectCallAsFunction(_context, fn, nil, 2, args, &exception);
            
            if (TiValueGetType(_context, exception) != kTITypeUndefined) {
                NSLog(@"error in filter function: %@", TiValueToId(_context, exception));
            }

            if (TiValueGetType(_context, returnVal) == kTITypeUndefined) {
                NSLog(@"no return value in filter function");
                return NO;
            }
            
            id r = TiValueToId(_context, returnVal);
            return [r boolValue];
        };
    }
    else {
        NSLog(@"could not compile filter function");
    }
    
    return [[result copy] autorelease];
    
}



#pragma mark -
#pragma mark Function Compiler

- (TiObjectRef)compile:(NSString *)source context:(TiContextRef)context {
    TiValueRef exception;
    
    TiStringRef code = TiStringCreateWithCFString((CFStringRef) [NSString stringWithFormat:@"(%@)", source]);
    
    BOOL syntaxValid = TiCheckScriptSyntax(context, code, NULL, 0, &exception);
    if (!syntaxValid) {
        TiStringRef exceptionIString = TiValueToStringCopy(context, exception, NULL);
        CFStringRef exceptionCF = TiStringCopyCFString(kCFAllocatorDefault, exceptionIString);
        NSLog(@"%@", exceptionCF);
        CFRelease(exceptionCF);
        TiStringRelease(exceptionIString);
        return nil;
    }
    
    TiValueRef compiled = TiEvalScript(context, code, NULL, NULL, 1, NULL);
    TiStringRelease(code);
    
    if (compiled) {
        TiObjectRef result = TiValueToObject(context, compiled, NULL);
        if (TiObjectIsFunction(context, result)) {
            return result;
        }
    }
    else {
        NSLog(@"no result");
    }
    
    return nil;
}

#pragma mark Bindings

- (void)bindCallback:(TiObjectCallAsFunctionCallback)fn name:(NSString*)name context:(TiContextRef)context; {    
	// create the invoker bridge
	TiStringRef invokerFnName = TiStringCreateWithCFString((CFStringRef) name);
	TiValueRef invoker = TiObjectMakeFunctionWithCallback(context, invokerFnName, fn);
	if (invoker) {
		TiObjectRef global = TiContextGetGlobalObject(context); 
		TiObjectSetProperty(context, global,   
							invokerFnName, invoker,   
							kTiPropertyAttributeReadOnly | kTiPropertyAttributeDontDelete,   
							NULL); 
	}
	TiStringRelease(invokerFnName);	
}

static TiValueRef ThrowException (TiContextRef ctx, NSString *message, TiValueRef *exception) {
	TiStringRef jsString = TiStringCreateWithCFString((CFStringRef)message);
	*exception = TiValueMakeString(ctx,jsString);
	TiStringRelease(jsString);
	return TiValueMakeUndefined(ctx);
}

static TiValueRef EmitCallback(TiContextRef jsContext, TiObjectRef jsFunction, TiObjectRef jsThis, size_t argCount, const TiValueRef args[], TiValueRef* exception) {
    
	if (argCount!=2) {
		return ThrowException(jsContext, @"invalid number of arguments", exception);
	}
	
    NSString * key = TiValueToId(jsContext, args[0]);
    NSString * value = TiValueToId(jsContext, args[1]);
    
    _emitBlock(key, value);
    
    return nil;
}


#pragma mark -
#pragma mark JavaScript Bridge

// copied from KrollObject

static NSDictionary * TiValueToDict(TiContextRef jsContext, TiValueRef value)
{
	TiObjectRef obj = TiValueToObject(jsContext, value, NULL);
	TiPropertyNameArrayRef props = TiObjectCopyPropertyNames(jsContext,obj);
	
	NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
	
	size_t count = TiPropertyNameArrayGetCount(props);
	for (size_t i = 0; i < count; i++)
	{
		TiStringRef jsString = TiPropertyNameArrayGetNameAtIndex(props, i);
		TiValueRef v = TiObjectGetProperty(jsContext, obj, jsString, NULL);
		NSString* jsonkey = [NSString stringWithCharacters:TiStringGetCharactersPtr(jsString) length:TiStringGetLength(jsString)];
		id jsonvalue = TiValueToId(jsContext,v);
		if (jsonvalue && jsonkey) {
			[dict setObject:jsonvalue forKey:jsonkey];
		}
	}
	
	TiPropertyNameArrayRelease(props);
	
	return [dict autorelease];
}

static id TiValueToId(TiContextRef jsContext, TiValueRef v)
{
	id result = nil;
	if (v) {
		TiType tt = TiValueGetType(jsContext, v);
		switch (tt) {
			case kTITypeUndefined:{
				result = nil;
				break;
			}
			case kTITypeNull: {
				result = [NSNull null];
				break;
			}
			case kTITypeBoolean: {
				result = [NSNumber numberWithBool:TiValueToBoolean(jsContext, v)];
				break;
			}
			case kTITypeNumber: {
				result = [NSNumber numberWithDouble:TiValueToNumber(jsContext, v, NULL)];
				break;
			}
			case kTITypeString: {
				TiStringRef stringRefValue = TiValueToStringCopy(jsContext, v, NULL);
				result = [(NSString *)TiStringCopyCFString
						  (kCFAllocatorDefault,stringRefValue) autorelease];
				TiStringRelease(stringRefValue);
				break;
			}
			case kTITypeObject: {
				TiObjectRef obj = TiValueToObject(jsContext, v, NULL);
				id privateObject = (id)TiObjectGetPrivate(obj);
                /* not supported
				if ([privateObject isKindOfClass:[KrollObject class]]) {
					result = [privateObject target];
					break;
				}
                */
				if (TiValueIsArray(jsContext,obj)) {
					TiValueRef length = TiObjectGetProperty(jsContext, obj, kTiStringLength, NULL);
					double len = TiValueToNumber(jsContext, length, NULL);
					NSMutableArray* resultArray = [[NSMutableArray alloc] initWithCapacity:len];
					for (size_t c=0; c<len; ++c)
					{
						TiValueRef valueRef = TiObjectGetPropertyAtIndex(jsContext, obj, c, NULL);
						id value = TiValueToId(jsContext,valueRef);
						//TODO: This is a temprorary workaround for the time being. We have to properly take care of [undefined] objects.
						if(value == nil){
							[resultArray addObject:[NSNull null]];
						}
						else{
							[resultArray addObject:value];
						}
					}
					result = [resultArray autorelease];
					break;
				}
				if (TiValueIsDate(jsContext, obj)) {
					TiValueRef fn = TiObjectGetProperty(jsContext, obj, kTiStringGetTime, NULL);
					TiObjectRef fnObj = TiValueToObject(jsContext, fn, NULL);
					TiValueRef resultDate = TiObjectCallAsFunction(jsContext,fnObj,obj,0,NULL,NULL);
					double value = TiValueToNumber(jsContext, resultDate, NULL);
					result = [NSDate dateWithTimeIntervalSince1970:value/1000]; // ms for JS, sec for Obj-C
					break;
				}
				if (TiObjectIsFunction(jsContext,obj)) {
                    NSLog(@"function not supported");
                    /*
                     result = [[[KrollCallback alloc] initWithCallback:obj thisObject:TiContextGetGlobalObject(jsContext) context:context] autorelease];
                     */
				} else {
					result = TiValueToDict(jsContext,v);
				}
				break;
			}
			default: {
				break;
			}
		}
	}
	return result;
}

static TiValueRef IdToTiValue(TiContextRef jsContext, id obj)
{
	if (obj == nil)
	{
		return TiValueMakeUndefined(jsContext);
	}
	else if ([obj isKindOfClass:[NSNull class]])
	{
		return TiValueMakeNull(jsContext);
	}
	else if ([obj isKindOfClass:[NSURL class]])
	{
        NSString* urlString = [obj absoluteString];
		TiStringRef jsString = TiStringCreateWithCFString((CFStringRef) urlString);
		TiValueRef result = TiValueMakeString(jsContext,jsString);
		TiStringRelease(jsString);
		return result;
	}
	else if ([obj isKindOfClass:[NSString class]])
	{
		TiStringRef jsString = TiStringCreateWithCFString((CFStringRef) obj);
		TiValueRef result = TiValueMakeString(jsContext,jsString);
		TiStringRelease(jsString);
		return result;
	}
	else if ([obj isKindOfClass:[NSNumber class]])
	{
		const char *ch = [obj objCType];
		if ('c' == ch[0])
		{
			return TiValueMakeBoolean(jsContext, [obj boolValue]);
        }
		else
		{
			return TiValueMakeNumber(jsContext, [obj doubleValue]);
		}
	}
	else if ([obj isKindOfClass:[NSArray class]])	
	{
		size_t count = [obj count];
		TiValueRef args[count];
		for (size_t c=0;c<count;c++)
		{
			args[c]=IdToTiValue(jsContext,[obj objectAtIndex:c]);
		}
		return TiObjectMakeArray(jsContext, count, args, NULL);
	}
	else if ([obj isKindOfClass:[NSDictionary class]])
	{
		//Why not just make a blank object?
		TiValueRef value = TiEvalScript(jsContext, kTiStringNewObject, NULL, NULL, 0, NULL);
		TiObjectRef objRef = TiValueToObject(jsContext, value, NULL);
		for (id prop in obj)
		{
			TiStringRef key = TiStringCreateWithCFString((CFStringRef) prop);
			TiValueRef value = IdToTiValue(jsContext,[obj objectForKey:prop]);
			TiObjectSetProperty(jsContext, objRef, key, value, 0, NULL);
			TiStringRelease(key);
		}
		return objRef;
	}
	else if ([obj isKindOfClass:[NSException class]])
	{
		TiStringRef jsString = TiStringCreateWithCFString((CFStringRef) [obj reason]);
		TiValueRef result = TiValueMakeString(jsContext,jsString);
		TiStringRelease(jsString);
		return TiObjectMakeError(jsContext, 1, &result, NULL);
	}
	else if ([obj isKindOfClass:[KrollMethod class]])
	{
        /* never going to be the same context
		KrollContext * ourContext = [(KrollMethod *)obj context];
		if (context == ourContext)
		{
			return [(KrollMethod *)obj jsobject];
		}
        */
		return TiObjectMake(jsContext,KrollMethodClassRef,obj);
	}
	else if ([obj isKindOfClass:[KrollWrapper class]])
	{
		if ([KrollBridge krollBridgeExists:[(KrollWrapper *)obj bridge]])
		{
			return [(KrollWrapper *)obj jsobject];
		}
		//Otherwise, this flows to null.
	}
	else if ([obj isKindOfClass:[KrollObject class]])
	{
        /* never going to be the same context
		KrollContext * ourContext = [(KrollObject *)obj context];
		TiObjectRef ourJsObject = [(KrollObject *)obj jsobject];
		if ((context == ourContext) && (ourJsObject != NULL))
		{
			return ourJsObject;
		}
        */
		return TiObjectMake(jsContext,KrollObjectClassRef,obj);
	}
	else if ([obj isKindOfClass:[KrollCallback class]])
	{
		return [(KrollCallback*)obj function];
	}
	else if ([obj isKindOfClass:[NSDate class]])
	{
		NSDate *date = (NSDate*)obj;
		double number = [date timeIntervalSince1970]*1000; // JS is ms
 		TiValueRef args [1];
		args[0] = TiValueMakeNumber(jsContext,number);
		return TiObjectMakeDate(jsContext,1,args,NULL);
	}
    /* appears to require a local kroll bridge
	else
	{
		KrollBridge * ourBridge = (KrollBridge *)[context delegate];
		if (ourBridge != nil)
		{
			if (![ourBridge usesProxy:obj])
			{
				if (![context isKJSThread])
				{
					DebugLog(@"[WARN] Creating %@ in a different context than the calling function.",obj);
					ourBridge = [KrollBridge krollBridgeForThreadName:[[NSThread currentThread] name]];
				}
				return [[ourBridge registerProxy:obj] jsobject];
			}
			KrollObject * objKrollObject = [ourBridge krollObjectForProxy:obj];
			return [objKrollObject jsobject];
		}
		
		DebugLog(@"[WARN] Generating a new TiObject for KrollObject %@ because the contexts %@ and its context %@ differed.",obj,context,ourBridge);
#ifdef KROLL_COVERAGE
		KrollObject *o = [[[KrollCoverageObject alloc] initWithTarget:obj context:context] autorelease];
#else
		KrollObject *o = [[[KrollObject alloc] initWithTarget:obj context:context] autorelease];
#endif
		return TiObjectMake(jsContext,KrollObjectClassRef,o);
	}
    */
	return TiValueMakeNull(jsContext);
}

@end
