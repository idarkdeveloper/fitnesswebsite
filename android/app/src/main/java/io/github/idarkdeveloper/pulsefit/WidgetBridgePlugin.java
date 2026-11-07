package io.github.idarkdeveloper.pulsefit;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Lets the PulseFit page update the home-screen widget and ask Android to pin one. */
@CapacitorPlugin(name = "PulseFitWidget")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        Context c = getContext();
        c.getSharedPreferences(StreakWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putInt("streak", call.getInt("streak", 0))
            .putString("status", call.getString("status", ""))
            .putString("detail", call.getString("detail", ""))
            .putString("asOf", call.getString("asOf", ""))
            .apply();
        StreakWidget.refreshAll(c);
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        Context c = getContext();
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        JSObject r = new JSObject();
        r.put("canPin", Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && m.isRequestPinAppWidgetSupported());
        r.put("count", m.getAppWidgetIds(new ComponentName(c, StreakWidget.class)).length);
        call.resolve(r);
    }

    @PluginMethod
    public void pin(PluginCall call) {
        Context c = getContext();
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        boolean ok = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && m.isRequestPinAppWidgetSupported()
            && m.requestPinAppWidget(new ComponentName(c, StreakWidget.class), null, null);
        JSObject r = new JSObject();
        r.put("requested", ok);
        call.resolve(r);
    }
}
