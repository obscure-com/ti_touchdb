//
//  TDRevision.h
//  TouchDB
//
//  Created by Jens Alfke on 12/2/11.
//  Copyright (c) 2011 Couchbase, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
@class TDBody;


/** Database sequence ID */
typedef SInt64 SequenceNumber;


/** Stores information about a revision -- its docID, revID, and whether it's deleted. It can also store the sequence number and document contents (they can be added after creation). */
@interface TDRevision : NSObject
{
    @private
    NSString* _docID, *_revID;
    TDBody* _body;
    SequenceNumber _sequence;
    bool _deleted;
    bool _missing;
}

- (id) initWithDocID: (NSString*)docID 
               revID: (NSString*)revID 
             deleted: (BOOL)deleted;
- (id) initWithBody: (TDBody*)body;
- (id) initWithProperties: (NSDictionary*)properties;

+ (TDRevision*) revisionWithProperties: (NSDictionary*)properties;

@property (readonly) NSString* docID;
@property (readonly) NSString* revID;
@property (readonly) bool deleted;
@property bool missing;

@property (retain) TDBody* body;
@property (copy) NSDictionary* properties;
@property (copy) NSData* asJSON;

- (id) objectForKeyedSubscript: (NSString*)key;  // enables subscript access in Xcode 4.4+

@property SequenceNumber sequence;

- (NSComparisonResult) compareSequences: (TDRevision*)rev;

/** Generation number: 1 for a new document, 2 for the 2nd revision, ...
    Extracted from the numeric prefix of the revID. */
@property (readonly) unsigned generation;

+ (unsigned) generationFromRevID: (NSString*)revID;

+ (BOOL) parseRevID: (NSString*)revID
     intoGeneration: (int*)outNum
          andSuffix: (NSString**)outSuffix;

- (TDRevision*) copyWithDocID: (NSString*)docID revID: (NSString*)revID;

@end



/** An ordered list of TDRevs. */
@interface TDRevisionList : NSObject <NSFastEnumeration>
{
    @private
    NSMutableArray* _revs;
}

- (id) init;
- (id) initWithArray: (NSArray*)revs;

@property (readonly) NSUInteger count;

- (TDRevision*) revWithDocID: (NSString*)docID revID: (NSString*)revID;

- (NSEnumerator*) objectEnumerator;

@property (readonly) NSArray* allRevisions;
@property (readonly) NSArray* allDocIDs;
@property (readonly) NSArray* allRevIDs;

- (TDRevision*) objectAtIndexedSubscript: (NSUInteger)index;  // enables subscript access in XC4.4+

- (void) addRev: (TDRevision*)rev;
- (void) removeRev: (TDRevision*)rev;

- (void) limit: (NSUInteger)limit;
- (void) sortBySequence;

@end


/** Compares revision IDs by CouchDB rules: generation number first, then the suffix. */
NSComparisonResult TDCompareRevIDs(NSString* revID1, NSString* revID2);

/** SQLite-compatible collation (comparison) function for revision IDs. */
int TDCollateRevIDs(void *context,
                    int len1, const void * chars1,
                    int len2, const void * chars2);
