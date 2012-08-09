package com.obscure.titouchdb.js;

import java.util.HashMap;
import java.util.Map;

import org.elasticsearch.script.javascript.support.NativeMap;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.WrapFactory;

import android.util.Log;

import com.couchbase.touchdb.TDDatabase;
import com.couchbase.touchdb.TDRevision;
import com.couchbase.touchdb.TDStatus;
import com.couchbase.touchdb.TDValidationBlock;
import com.couchbase.touchdb.TDValidationContext;

public class JavascriptValidationCompiler {

	public TDValidationBlock compileValidationFunction(TDDatabase db, String validationFunction, String language) {
		if ("javascript".equalsIgnoreCase(language)) {
			return new TDValidationBlockRhino(db, validationFunction);
		}
		throw new IllegalArgumentException(language + " is not supported");
	}
}

class TDValidationBlockRhino implements TDValidationBlock {
	/**
	 * Wrap Factory for Rhino Script Engine
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static class CustomWrapFactory extends WrapFactory {
		public CustomWrapFactory() {
			setJavaPrimitiveWrap(false); // RingoJS does that..., claims its
											// annoying...
		}

		public Scriptable wrapAsJavaObject(Context cx, Scriptable scope, Object javaObject, Class staticType) {
			if (javaObject instanceof Map) {
				return new NativeMap(scope, (Map) javaObject);
			}
			return super.wrapAsJavaObject(cx, scope, javaObject, staticType);
		}
	}

	private static final String	LCAT		= "TDValidationBlockRhino";

	private static WrapFactory	wrapFactory	= new CustomWrapFactory();

	private Scriptable			globalScope;

	private Map<String, Object>	secObj		= new HashMap<String, Object>();

	private String				src;

	private Map<String, Object>	userCtx		= new HashMap<String, Object>();

	public TDValidationBlockRhino(TDDatabase db, String src) {
		this.src = src;

		userCtx.put("db", db.getName());
		userCtx.put("name", "touchdb");
		userCtx.put("roles", new String[0]);

		Context ctx = Context.enter();
		try {
			ctx.setOptimizationLevel(-1);
			ctx.setWrapFactory(wrapFactory);
			globalScope = ctx.initStandardObjects(null, true);
		}
		finally {
			Context.exit();
		}
	}

	public boolean validate(TDRevision rev, TDValidationContext validationContext) {
		boolean result = false;
		Context ctx = Context.enter();
		try {
			ctx.setOptimizationLevel(-1);
			ctx.setWrapFactory(wrapFactory);

			// get the arguments for the call
			Map<String, Object> newDoc = rev.getBody().getProperties();
			Map<String, Object> oldDoc = validationContext.getCurrentRevision() != null ? validationContext.getCurrentRevision().getProperties() : null;

			// register the validate function
			String validateSrc = "var validate = " + src + ";";
			ctx.evaluateString(globalScope, validateSrc, "validate", 1, null);

			// find the validate function and execute it
			Function mapFun = (Function) globalScope.get("validate", globalScope);
			Object[] functionArgs = { newDoc, oldDoc, userCtx, secObj };
			mapFun.call(ctx, globalScope, globalScope, functionArgs);
			result = true;
		}
		catch (RhinoException e) { 
			validationContext.setErrorType(new TDStatus(TDStatus.FORBIDDEN));
			validationContext.setErrorMessage(e.getMessage());
		}
		finally {
			Context.exit();
		}

		return result;
	}

}