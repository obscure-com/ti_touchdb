//
//  TiMacroFixups.h
//  titouchdb
//
//  Override borked macros in Titanium header files.  Eventually, this
//  header file should go away.
//
//  See:
//  https://jira.appcelerator.org/browse/TIMOB-8381
//
//  Created by Paul Mietz Egli on 8/8/12.
//
//

#define ENSURE_ARG_OR_NULL_AT_INDEX(out,args,index,type) \
if (args==nil || args==[NSNull null]) \
{ \
out = nil; \
} \
else if ([args isKindOfClass:[NSArray class]]) { \
if ([args count]>index) {\
out = [args objectAtIndex:index]; \
}\
else { \
out = nil; \
} \
if ([out isKindOfClass:[NSNull class]]) { \
out = nil; \
} else if (out && ![out isKindOfClass:[type class]]) { \
[self throwException:TiExceptionInvalidType subreason:[NSString stringWithFormat:@"expected: %@, was: %@",[type class],[out class]] location:CODELOCATION]; \
} \
} \
