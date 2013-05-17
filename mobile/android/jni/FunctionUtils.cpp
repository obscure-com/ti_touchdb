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


class JavaMethod
{
public:
	static JavaMethod* New(jobject obj, const char * name, const char * signature)
	{
		JNIEnv* env = JNIUtil::getJNIEnv();

		jobject target = env->NewGlobalRef(obj);
		jclass clazz = env->GetObjectClass(obj);
		jmethodID methodID = env->GetMethodID(clazz, name, signature);
		if (methodID == 0)
		{
			LOGW(LOG_TAG, "unable to find method %s with signature %s", name, signature);
			return NULL;
		}

		return new JavaMethod(target, methodID);
	};
	
	JavaMethod(jobject target, jmethodID methodID);
	
	void Invoke(const Arguments &args);
	
private:
	jobject target_;
	jmethodID methodID_;
};

JavaMethod::JavaMethod(jobject target, jmethodID methodID)
	: target_(target)
	, methodID_(methodID)
{
}

void JavaMethod::Invoke(const Arguments &args)
{
	JNIEnv* env = JNIUtil::getJNIEnv();
	jvalue jargs[args.Length()];
	for (int i=0; i < args.Length(); i++) {
		jargs[i].l = TypeConverter::jsValueToJavaObject(args[i]);
	}
	
	env->CallVoidMethodA(target_, methodID_, jargs);
}

Handle<Value> JSWrapper( const Arguments &args )
{
	JavaMethod* m = (JavaMethod*) External::Unwrap(args.Data());
	m->Invoke(args);
	return Undefined();
}

#ifdef __cplusplus
extern "C" {
#endif

// TODO make a static method of the module

JNIEXPORT void JNICALL Java_com_obscure_titouchdb_TitouchdbModule_registerGlobalFunction
  (JNIEnv * env, jobject obj, jobject target, jstring name, jstring signature)
{
	const char * cname = env->GetStringUTFChars(name, 0);
	const char * csignature = env->GetStringUTFChars(signature, 0);

	Local<Object> global = V8Runtime::globalContext->Global();
	global->Set(String::New(cname), FunctionTemplate::New(JSWrapper, External::Wrap(JavaMethod::New(target, cname, csignature)))->GetFunction());
	
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