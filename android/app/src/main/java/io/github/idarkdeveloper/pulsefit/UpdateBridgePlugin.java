package io.github.idarkdeveloper.pulsefit;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * In-app update: downloads the newest Mizan APK from this project's GitHub release and opens Android's
 * installer on it. Android still asks you to confirm the install; nothing is installed silently.
 */
@CapacitorPlugin(name = "MizanUpdate")
public class UpdateBridgePlugin extends Plugin {
    /** Only this project's own release files may be downloaded and offered for install. */
    private static final String ALLOWED = "https://github.com/idarkdeveloper/fitnesswebsite/releases/";
    private boolean busy;

    @PluginMethod
    public void install(PluginCall call) {
        final String url = call.getString("url", "");
        if (url == null || !url.startsWith(ALLOWED) || !url.endsWith(".apk")) { call.reject("Not a Mizan release"); return; }
        synchronized (this) {
            if (busy) { call.reject("Already downloading"); return; }
            busy = true;
        }
        final Context ctx = getContext();
        new Thread(() -> {
            HttpURLConnection c = null;
            try {
                File dir = new File(ctx.getCacheDir(), "update");
                if (!dir.exists() && !dir.mkdirs()) throw new Exception("No space for the download");
                File out = new File(dir, "mizan.apk");
                c = (HttpURLConnection) new URL(url).openConnection();
                c.setInstanceFollowRedirects(true);
                c.setConnectTimeout(20000);
                c.setReadTimeout(30000);
                if (c.getResponseCode() != 200) throw new Exception("Download failed (" + c.getResponseCode() + ")");
                long total = c.getContentLengthLong(), done = 0;
                int last = -1;
                try (InputStream in = c.getInputStream(); OutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        os.write(buf, 0, n);
                        done += n;
                        int pct = total > 0 ? (int) (done * 100 / total) : -1;
                        if (pct != last) {
                            last = pct;
                            JSObject p = new JSObject();
                            p.put("percent", pct);
                            notifyListeners("progress", p);
                        }
                    }
                }
                Uri uri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", out);
                Intent view = new Intent(Intent.ACTION_VIEW)
                    .setDataAndType(uri, "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(view);
                call.resolve();
            } catch (Exception e) {
                call.reject(e.getMessage() == null ? "Download failed" : e.getMessage());
            } finally {
                if (c != null) c.disconnect();
                synchronized (UpdateBridgePlugin.this) { busy = false; }
            }
        }).start();
    }
}
