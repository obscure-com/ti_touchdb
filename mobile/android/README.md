Titanium SDK build issue
========================

There is a problem with building modules that use native C++ code:

  https://jira.appcelerator.org/browse/TIMOB-13696
  
This issue affects Titanium SDKs up to and including version 3.2.3.GA.  In order to
build this module for Android, you need to patch your `$TISDK/android/builder.py` file
as follows:

```
--- builder.py  2014-05-22 10:01:06.000000000 -0700
+++ builder.py  2014-05-22 10:01:35.000000000 -0700
@@ -1754,8 +1754,7 @@
      # profiler
      apk_zip.write(os.path.join(lib_source_dir, 'libtiprofiler.so'), lib_dest_dir + 'libtiprofiler.so')
 
-     for fname in ('libkroll-v8.so', 'libstlport_shared.so'):
-       apk_zip.write(os.path.join(lib_source_dir, fname), lib_dest_dir + fname)
+     apk_zip.write(os.path.join(lib_source_dir, 'libkroll-v8.so'), lib_dest_dir + 'libkroll-v8.so')
             
    self.apk_updated = True
```
