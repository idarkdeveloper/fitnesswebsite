package io.github.idarkdeveloper.pulsefit;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);   // home-screen widget bridge (must come before super)
        registerPlugin(ShareBridgePlugin.class);    // "Share to Mizan": reads a shared scale report image
        registerPlugin(UpdateBridgePlugin.class);   // in-app update: download the new APK and open the installer
        super.onCreate(savedInstanceState);
    }
}
