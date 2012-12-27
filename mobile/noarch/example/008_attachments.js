Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test008');
  try {
    var doc = createDocWithProperties(db, {
      testName: 'test attachments'
    });
    var rev = doc.newRevision();
    
    assert(rev, 'doc.newRevision() returned null');
    assert(rev.attachmentNames, 'missing attachmentNames property');
    assert(rev.attachmentNames.length == 0, "found "+rev.attachmentNames.length+" attachments where there shouldn't be any: "+rev.attachmentNames.join(','));
    assert(!rev.attachmentNamed('index.html'), "found index.html attachment which shouldn't exist");
    
    var buf = Ti.createBuffer({ value: 'This is a test attachment!' });
    var attach1 = rev.addAttachment('index.html', 'text/plain; charset=utf-8', buf.toBlob());
    rev.save();
    
    var rev2 = doc.currentRevision;
    assert(rev2.attachmentNames.length == 1, "expect one attachment name: "+rev2.attachmentNames.length);
    assert(rev2.attachmentNames[0] === 'index.html', 'incorrect attachment names array: '+rev.attachmentNames.join(','));
    
    var refetch = rev2.attachmentNamed('index.html');
    assert(refetch, 're-fetched attachment missing');
    assert(refetch.contentType === 'text/plain; charset=utf-8', 'incorrect content type: '+refetch.contentType);
    
    var body = refetch.body;
    assert(body, "missing body on re-fetch");
    assert(body.mimeType === refetch.contentType, "mismatched content types: "+body.mimeType);
    assert(body.text === 'This is a test attachment!', 'incorrect attachment body text: '+body.text);
    
    refetch.updateBody(null);
    
    var rev3 = doc.currentRevision;
    assert(rev3.attachmentNames.length == 0, "expected no attachments following delete: "+rev3.attachmentNames.join(','));
    
    var missing = rev3.attachmentNamed('index.html');
    assert(!missing, "fetched deleted attachment");

    // inline attachments
    var inline = {
      "_attachments" :     {
        "image.png" :         {
          "content_type" : "image/png",
          data : "iVBORw0KGgoAAAANSUhEUgAAADoAAABHCAMAAABh2aQFAAADAFBMVEUFBwYFBwYDBQQDBQQEBgUGCAcJCgkKDAsLDQwMDg0NDg0OEA8REhEUFRQVFxYWGBcXGRgcHR0nKCcqKysrLCstLi0wMTA1NjU6Ozs8PT1AQkFKS0pRUlJUVVVXWFhaW1tdXl1hYmFmZ2dvcG92d3d8fXx/gH+Cg4KEhYSGhoaNjY2VlpaZmpqampqcnJyfn5+ioqKkpaSoqKisrKyvr6+ysrKzs7O0tLS1tbW3t7e4ubm4ubm6u7q7vLy9vb29vr6/wMDFxcXIyMjJycnJycnLy8vMzMzMzMzNzc3T09PY2Nna2tvb29zd3d3d3d3e3t/j4+Pk5OXl5eXl5eXm5ubp6ens7Ozt7e3v7+/z8/P19fX39/f5+fn6+vr7+/v8/Pz9/f39/f3+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9z3DJaAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAHGlUWHRTb2Z0d2FyZQAAAAAAUGFpbnQuTkVUIHYzLjM2yrDfJAAAA2hJREFUWIXt121TokAAB/C9BdEwLkULQy0f4Dq1UTS7HqxLnXMUzkmb8oE0GIdvuJ/wFihPPWyW5l72H8ZlgB/LLiyLYDHsttp+07l/ujfAsD/Ruj7TGUx65Z9AHUn8V785qE4eFKC2wuJ3n5H5xAidgf7PYAn5TTr2gH5gGjr1T+OfFGfeb9x/hBq/q1meSz76pYZWzcQYSEH+ty86H9Ry2EEaAEZ+IabWC3b7LKSAHTr59I7coLocC0OKBq7cO39PblCjGHIrdCgr5usPC9K26jka/LWQZgW5Z5BRNBAhWA31hZdUi4iiVowC65iOlXQiihSOXrcAhrJe9/dfOpODm5amxQ4JReO0c8lMgKKW56CEFglFqoC7ikqU8wfsss9gQiWh6CpKAZicWEMlubzPVHpEQs0iS2NqX3wp/mrpYMEgoEjPB2Byaq8teqm3aqO/SCh6zMZLprs6PAq82uyMhKLZdDnehim3o+lIi4iuRj1w20tJa08k0WutzDr1QmGtk4noxB0TNHftm6Ky21Ow6J9qvNNamJv7pnrKuWLKvde+KMq7VBj7pydOY6nEB2jhk37SDboTwmHED1Ct7qTpf+R45v9Sa+E9n/49YAudXeUzUgu/6PuFMn7vTouVZ9T81sN7BoWSPSH0TqqGJzWKXCBMRxWEGl+5Oj6eOxyjE1jGu0biTg2fOvul6F1rK8p9q+eD+xpq7NlzxwpFSghvaEWEgSc1JSjN0TQNSphSrLJGp0n2zMwxb9/rG3Qi7jbt8zNpTKPc4WiVojp71IwePnnTIR/TcNHmxNkNl8oxp2tUP+LEcHnLzRlE4jbVIsL4hjtq80Jzb4Xa7RdHW+hjjFeXtaZnMpNbrRU9HzMK2kJxW+9wUQ1lUINLm9o+S4krdCHvNrZRQ4KygfQMXbTpCyoGIClFzche4U4K4ct26DDh0vx5vX4+ep/OC2HIwqhioevdFJ7YT4HTVjvBK7SQdq63UjSrZdP5G/yUanIFf02Mv5ee0Y1kR9aQdSlr2ymyZrozoC3T+RS28O/CdGLZa9YmvQ1+YLw6fwe19q6Q8ZnjKH46LkB7XBBi+/4SFy/H+hm47E/rFaWiKBWFvKi11X4J3CoDtdPt4KX7T9Htem7Gizqo3gGzU61dXHnkeq1Yz+VZtWP+AT+LLVmIy5KQAAAAAElFTkSuQmCC",
        }
      }
    };
    
    var inlinedoc = db.documentWithID('inline_document_test1');
    inlinedoc.putProperties(inline);
    
    var inlinerefetch = db.documentWithID('inline_document_test1');
    assert(inlinerefetch, "did not refetch inline attachment doc");
    
    var inlinerev = inlinerefetch.currentRevision;
    assert(inlinerev.attachmentNames.length == 1, "expect one attachment name for inline attachment revision");
    assert(inlinerev.attachmentNames[0] === 'image.png', 'incorrect attachment names array: '+rev.attachmentNames.join(','));
    
    var inlineatt = inlinerev.attachmentNamed('image.png');
    assert(inlineatt, "missing attachment named image.png");
    assert(inlineatt.body, "empty body for attachment");
    assert(inlineatt.body.mimeType == 'image/png', "incorrect mime type for inline attachment: "+inlineatt.body.mimeType);

    if (Ti.Platform.osname != 'android') {
      // not sure why this locks up the test
      imageView.image = inlineatt.body;
    }
   
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}