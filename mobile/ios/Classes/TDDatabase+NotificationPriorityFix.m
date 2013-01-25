//
//  TDDatabase+NotificationPriorityFix.m
//  titouchdb
//
//  Created by Paul Mietz Egli on 1/24/13.
//
//

#import "TDDatabase+NotificationPriorityFix.h"
#import "TD_Revision.h"
#import "TD_DatabaseChange.h"

@implementation TDDatabase (NotificationPriorityFix)

extern NSString* const TD_DatabaseChangesNotification;

- (void) tddbNotification: (NSNotification*)n {
    if ([n.name isEqualToString: TD_DatabaseChangesNotification]) {
        for (TD_DatabaseChange* change in (n.userInfo)[@"changes"]) {
            TD_Revision* winningRev = change.winningRevision;
            NSURL* source = change.source;
            
            // Notify the corresponding instantiated TDDocument object (if any):
            [[self cachedDocumentWithID: winningRev.docID] revisionAdded: change];
            
            // Post a database-changed notification, but only post one per runloop cycle by using
            // a notification queue. If the current notification has the "external" flag, make sure
            // it gets posted by clearing any pending instance of the notification that doesn't have
            // the flag.
            NSDictionary* userInfo = source ? $dict({@"external", $true}) : nil;
            NSNotification* n = [NSNotification notificationWithName: kTDDatabaseChangeNotification
                                                              object: self
                                                            userInfo: userInfo];
            NSNotificationQueue* queue = [NSNotificationQueue defaultQueue];
            if (source != nil)
                [queue dequeueNotificationsMatching: n coalesceMask: NSNotificationCoalescingOnSender];
            [queue enqueueNotification: n
                          postingStyle: NSPostNow
                          coalesceMask: NSNotificationCoalescingOnSender
                              forModes: @[NSRunLoopCommonModes]];
        }
    }
}

@end
