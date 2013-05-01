Titanium SDK build issue
========================

There is a problem with building modules that use native C++ code:

  https://jira.appcelerator.org/browse/TIMOB-13696
  
This issue affects Titanium SDKs up to and including version 3.1.0.GA.  In order to
build this module for Android, you need to patch your `$TISDK/android/builder.py` file
as follows:

```
--- builder.py	2013-04-30 16:56:15.000000000 -0700
+++ builder.py.orig	2013-04-30 16:40:00.000000000 -0700
@@ -1680,11 +1680,11 @@
 
 		# add module native libraries
 		for module in self.modules:
-			exclude_libs = ['libstlport_shared.so']
+			exclude_libs = []
 			add_native_libs(module.get_resource('libs'), exclude_libs)
 
 		# add any native libraries : libs/**/*.so -> lib/**/*.so
-		add_native_libs(os.path.join(self.project_dir, 'libs'), ['libstlport_shared.so'])
+		add_native_libs(os.path.join(self.project_dir, 'libs'))
 
 		# add sdk runtime native libraries
 		debug("installing native SDK libs")
```