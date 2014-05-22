LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := function-utils
LOCAL_SRC_FILES := FunctionUtils.cpp

LOCAL_CFLAGS := -g -fpermissive "-I$(TI_MOBILE_SDK)/android/native/include"
LOCAL_LDLIBS := -L$(SYSROOT)/usr/lib -llog "-L$(TI_MOBILE_SDK)/android/native/libs/$(TARGET_ARCH_ABI)" -lkroll-v8

LOCAL_STATIC_LIBRARIES += libv8

include $(BUILD_SHARED_LIBRARY)
