package io.github.idarkdeveloper.pulsefit;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Listens for a few seconds to what SwitchBot devices broadcast over Bluetooth (a room thermometer sends its
 * temperature and humidity that way) and hands the raw bytes to the Mizan page, which reads the numbers.
 * It never connects to a device, and only SwitchBot broadcasts are passed on.
 */
@CapacitorPlugin(name = "MizanBle", permissions = {
    @Permission(alias = "scan", strings = { Manifest.permission.BLUETOOTH_SCAN }),
    @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION })
})
public class BleBridgePlugin extends Plugin {
    private static final int SWITCHBOT = 0x0969;   // SwitchBot's Bluetooth company id
    private static final ParcelUuid SERVICE = ParcelUuid.fromString("0000fd3d-0000-1000-8000-00805f9b34fb");
    private boolean busy;

    /** Android 12+ has its own Bluetooth scan permission; before that a scan needed the location permission. */
    private String alias() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? "scan" : "location";
    }

    @PluginMethod
    public void scan(PluginCall call) {
        if (getPermissionState(alias()) != PermissionState.GRANTED) {
            requestPermissionForAlias(alias(), call, "afterPermission");
            return;
        }
        start(call);
    }

    @PermissionCallback
    private void afterPermission(PluginCall call) {
        if (getPermissionState(alias()) != PermissionState.GRANTED) { call.reject("denied"); return; }
        start(call);
    }

    private static String hex(byte[] b) {
        if (b == null) return "";
        StringBuilder s = new StringBuilder(b.length * 2);
        for (byte x : b) s.append(String.format("%02x", x & 0xff));
        return s.toString();
    }

    private void start(PluginCall call) {
        synchronized (this) {
            if (busy) { call.reject("busy"); return; }
            busy = true;
        }
        try {
            BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
            BluetoothAdapter adapter = bm == null ? null : bm.getAdapter();
            if (adapter == null || !adapter.isEnabled()) { done(); call.reject("off"); return; }
            final BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
            if (scanner == null) { done(); call.reject("off"); return; }
            final Map<String, JSObject> found = new LinkedHashMap<>();
            final ScanCallback cb = new ScanCallback() {
                @Override
                public void onScanResult(int type, ScanResult r) {
                    ScanRecord rec = r.getScanRecord();
                    if (rec == null) return;
                    byte[] mfr = rec.getManufacturerSpecificData(SWITCHBOT), svc = rec.getServiceData(SERVICE);
                    if (mfr == null && svc == null) return;
                    String addr = r.getDevice().getAddress();
                    synchronized (found) {
                        JSObject o = found.get(addr);
                        if (o == null) { o = new JSObject(); o.put("addr", addr); found.put(addr, o); }
                        // The two halves of a broadcast can arrive separately: keep the latest of each.
                        if (mfr != null) o.put("mfr", hex(mfr));
                        if (svc != null) o.put("svc", hex(svc));
                        o.put("rssi", r.getRssi());
                        if (rec.getDeviceName() != null) o.put("name", rec.getDeviceName());
                    }
                }
            };
            ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
            scanner.startScan(null, settings, cb);
            int ms = Math.max(2000, Math.min(15000, call.getInt("ms", 6000)));
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                try { scanner.stopScan(cb); } catch (Exception ignored) { /* Bluetooth was switched off meanwhile */ }
                JSArray list = new JSArray();
                synchronized (found) { for (JSObject o : found.values()) list.put(o); }
                JSObject out = new JSObject();
                out.put("devices", list);
                done();
                call.resolve(out);
            }, ms);
        } catch (SecurityException e) {
            done();
            call.reject("denied");
        } catch (Exception e) {
            done();
            call.reject("failed");
        }
    }

    private synchronized void done() { busy = false; }
}
