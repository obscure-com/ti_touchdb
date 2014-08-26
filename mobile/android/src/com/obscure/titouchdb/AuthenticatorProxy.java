package com.obscure.titouchdb;

import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.annotations.Kroll;

import com.couchbase.lite.auth.Authenticator;

@Kroll.proxy(parentModule = TitouchdbModule.class)
public class AuthenticatorProxy extends KrollProxy {

    private static final String LCAT = "AuthenticatorProxy";

    private Authenticator authenticator;

    public AuthenticatorProxy(Authenticator authenticator) {
        this.authenticator = authenticator;
    }

    public Authenticator getAuthenticator() {
        return authenticator;
    }

}
