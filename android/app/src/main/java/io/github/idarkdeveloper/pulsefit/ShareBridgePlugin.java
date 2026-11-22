package io.github.idarkdeveloper.pulsefit;

import android.content.Intent;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

/**
 * "Share to Mizan": receives an image shared from another app (a smart scale's report card),
 * reads its text on the phone with ML Kit, and hands the lines to the Mizan page.
 * The image itself is never stored or sent anywhere.
 */
@CapacitorPlugin(name = "MizanShare")
public class ShareBridgePlugin extends Plugin {
    private static final String SEEN = "mizanShareSeen";

    private final Object lock = new Object();
    private JSObject result;      // text of the last shared image, until the page collects it
    private boolean busy;         // an image is being read right now
    private PluginCall waiting;   // the page asked while we were still reading

    @Override
    public void load() {
        accept(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        accept(intent);
    }

    /** The page asks: is there a shared image? Answers once the read has finished. */
    @PluginMethod
    public void pending(PluginCall call) {
        synchronized (lock) {
            if (busy) {
                if (waiting != null) waiting.resolve(new JSObject());
                waiting = call;
                return;
            }
            JSObject r = result != null ? result : new JSObject();
            result = null;
            call.resolve(r);
        }
    }

    private void accept(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        String type = intent.getType();
        if (type == null || !type.startsWith("image/") || intent.getBooleanExtra(SEEN, false)) return;
        intent.putExtra(SEEN, true);   // the same intent comes back if the activity is recreated
        Uri uri = Build.VERSION.SDK_INT >= 33
            ? intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class)
            : (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (uri == null) return;
        synchronized (lock) { busy = true; result = null; }
        try {
            InputImage image = InputImage.fromFilePath(getContext(), uri);
            TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS).process(image)
                .addOnSuccessListener(text -> finish(lines(text), null))
                .addOnFailureListener(e -> finish(null, "read"));
        } catch (Exception e) {
            finish(null, "open");
        }
    }

    private static JSArray lines(Text text) {
        JSArray out = new JSArray();
        for (Text.TextBlock block : text.getTextBlocks()) {
            for (Text.Line line : block.getLines()) {
                Rect b = line.getBoundingBox();
                if (b == null) continue;
                JSObject o = new JSObject();
                o.put("t", line.getText());
                o.put("x", b.left);
                o.put("y", b.top);
                o.put("w", b.width());
                o.put("h", b.height());
                out.put(o);
            }
        }
        return out;
    }

    private void finish(JSArray lines, String error) {
        JSObject r = new JSObject();
        r.put("shared", true);
        if (lines != null) r.put("lines", lines);
        if (error != null) r.put("error", error);
        synchronized (lock) {
            busy = false;
            if (waiting != null) { waiting.resolve(r); waiting = null; }
            else result = r;
        }
        notifyListeners("shared", new JSObject());   // the page then asks pending()
    }
}
