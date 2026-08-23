package io.antigravity.fintech;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import com.google.firebase.messaging.FirebaseMessaging;

public class WebAppInterface {
    private final Context mContext;

    public WebAppInterface(Context context) {
        this.mContext = context;
    }

    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        try {
            Vibrator vibrator = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(milliseconds);
                }
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void shareText(String title, String text) {
        try {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
            sendIntent.putExtra(Intent.EXTRA_TITLE, title);
            sendIntent.setType("text/plain");
            Intent shareIntent = Intent.createChooser(sendIntent, title);
            mContext.startActivity(shareIntent);
        } catch (Exception e) {
            showToast("Cannot open share dialog");
        }
    }

    @JavascriptInterface
    public void openUPIApp(String upiUrl) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(upiUrl));
            Intent chooser = Intent.createChooser(intent, "Pay with UPI");
            mContext.startActivity(chooser);
        } catch (Exception e) {
            showToast("No compatible UPI app found on device");
        }
    }

    @JavascriptInterface
    public String getDeviceModel() {
        return Build.MANUFACTURER + " " + Build.MODEL + " (Android " + Build.VERSION.RELEASE + ")";
    }

    @JavascriptInterface
    public void requestFCMToken() {
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    return;
                }
                String token = task.getResult();
                if (mContext instanceof MainActivity) {
                    ((MainActivity) mContext).onFCMTokenRetrieved(token);
                }
            });
    }
}
