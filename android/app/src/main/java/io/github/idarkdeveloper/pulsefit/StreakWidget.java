package io.github.idarkdeveloper.pulsefit;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Home-screen widget: day streak plus today's status. The web app pushes the numbers through
 * WidgetBridgePlugin (SharedPreferences "pulsefit_widget"); this only draws them.
 */
public class StreakWidget extends AppWidgetProvider {
    static final String PREFS = "pulsefit_widget";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, views(context));
    }

    static RemoteViews views(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        boolean fresh = today.equals(p.getString("asOf", ""));
        int streak = p.getInt("streak", 0);
        String status = fresh ? p.getString("status", "") : "Open PulseFit to see today";
        String detail = fresh ? p.getString("detail", "") : "";
        if (status.isEmpty()) status = streak == 0 ? "Start today 💪" : "Keep it going";

        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_streak);
        v.setTextViewText(R.id.widget_streak, String.valueOf(streak));
        v.setTextViewText(R.id.widget_status, status);
        v.setTextViewText(R.id.widget_detail, detail);
        v.setViewVisibility(R.id.widget_detail, detail.isEmpty() ? android.view.View.GONE : android.view.View.VISIBLE);

        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        v.setOnClickPendingIntent(R.id.widget_root, pi);
        return v;
    }

    /** Redraw every PulseFit widget on the home screen. */
    static void refreshAll(Context context) {
        AppWidgetManager m = AppWidgetManager.getInstance(context);
        int[] ids = m.getAppWidgetIds(new ComponentName(context, StreakWidget.class));
        for (int id : ids) m.updateAppWidget(id, views(context));
    }
}
