Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test08');
    db.create();

    try {
        var doc = createDocWithProperties(db, { testName: 'testAttachments' });
        var rev = doc.currentRevision;
        
        assert(rev.attachmentNames.length == 0, "found "+rev.attachmentNames.length+" attachments where there shouldn't be any: "+rev.attachmentNames.join(','));
        assert(!rev.attachmentNamed('index.html'), "found index.html attachment which shouldn't exist");
        
        var attach = rev.createAttachment('index.html', 'text/plain; charset=utf-8');
        assert(attach, "attachment is null");
        assert(attach.relativePath === 'index.html', 'incorrect relative path: '+attach.relativePath);
        assert(attach.name === attach.relativePath, 'path and name should be the same');
        
        var buf = Ti.createBuffer({ value: 'This is a test attachment!' });
        attach.body = buf.toBlob();
        
        var rev2 = doc.currentRevision;
        assert(rev2.revisionID.indexOf('2-') == 0, "expected revision starting with 2-; "+rev2.revisionID);
        
        assert(rev2.attachmentNames.length == 1, "expect one attachment name");
        assert(rev2.attachmentNames[0] === 'index.html', 'incorrect attachment names array: '+rev.attachmentNames.join(','));
        
        var refetch = rev2.attachmentNamed('index.html');
        assert(refetch, 're-fetched attachment missing');
        assert(refetch.contentType === 'text/plain; charset=utf-8', 'incorrect content type: '+refetch.contentType);
        
        var body = refetch.body;
        assert(body, "missing body on re-fetch");
        assert(body.mimeType === refetch.contentType, "mismatched content types: "+body.mimeType);
        assert(body.text === 'This is a test attachment!', 'incorrect attachment body text: '+body.text);
        
        refetch.deleteAttachment();
        
        /* hm, I expect a new revision on delete of an attachment
        var rev3 = doc.currentRevision;
        assert(rev3.revisionID.indexOf('3-') == 0, "expected revision starting with 3-; "+rev3.revisionID);
        assert(rev3.attachmentNames.length == 0, "expected no attachments following delete: "+rev3.attachmentNames.join(','));
        
        var missing = rev3.attachmentNamed('index.html');
        assert(!missing, "fetched deleted attachment");
        */
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}