#include <android/log.h>
#include <v8.h>

#include "V8Util.h"
#include "JNIUtil.h"
#include "V8Runtime.h"
#include "NativeObject.h"
#include "TypeConverter.h"

#define  LOG_TAG "FunctionCallNative"

using namespace v8;
using namespace titanium;

jobject target_;
jmethodID methodID_;
	
Handle<Value> JSWrapper( const Arguments &args )
{
	JNIEnv * env = JNIUtil::getJNIEnv();
	
	jvalue jargs[args.Length()];
	for (int i=0; i < args.Length(); i++) {
		jargs[i].l = TypeConverter::jsValueToJavaObject(args[i]);
	}
	
	env->CallVoidMethodA(target_, methodID_, jargs);
	
	return Undefined();
}


#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT void JNICALL Java_com_obscure_titouchdb_KrollViewMapBlock_registerGlobalFunction
  (JNIEnv * env, jobject obj, jstring name, jstring signature)
{
	const char * cname = env->GetStringUTFChars(name, 0);
	const char * csignature = env->GetStringUTFChars(signature, 0);

	target_ = env->NewGlobalRef(obj);

	jclass clazz = env->GetObjectClass(obj);
	methodID_ = env->GetMethodID(clazz, cname, csignature);
	if (methodID_ == 0)
	{
		LOGW(LOG_TAG, "unable to find method %s with signature %s", cname, csignature);
		return;
	}

	Local<Object> global = V8Runtime::globalContext->Global();
	global->Set(String::New(cname), FunctionTemplate::New(JSWrapper)->GetFunction());
	
	env->ReleaseStringUTFChars(name, cname);
	env->ReleaseStringUTFChars(signature, csignature);
}

jint JNI_OnLoad(JavaVM *vm, void *reserved)
{
	return JNI_VERSION_1_4;
}

#ifdef __cplusplus
}
#endif