package io.antigravity.fintech;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ValueCallback<Uri[]> uploadMessage;
    private final static int FILE_CHOOSER_RESULT_CODE = 1001;

    // Load local offline hybrid assets by default, or point to hosted endpoint:
    // private final String TARGET_URL = "https://your-production-domain.com";
    private final String TARGET_URL = "file:///android_asset/www/index.html";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefresh);

        // Configure High-Performance WebView Settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        // Register Native JavaScript Bridge
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidNative");

        // WebChromeClient (Handles KYC File Uploads, Camera Capture & Page Title)
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }
                uploadMessage = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        // WebViewClient (Handles Navigation & External Schemes like UPI, Tel, Mailto)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
                    return false; // Render within WebView
                }
                // External intents (UPI apps, phone dialer, email)
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return true;
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                swipeRefreshLayout.setRefreshing(false);
                syncFCMTokenToWeb();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                swipeRefreshLayout.setRefreshing(false);
            }
        });

        // Swipe-to-refresh pull gesture
        swipeRefreshLayout.setOnRefreshListener(() -> webView.reload());
        swipeRefreshLayout.setColorSchemeResources(R.color.primary_emerald);

        // Load the Application
        webView.loadUrl(TARGET_URL);

        // Fetch initial FCM token
        FirebaseMessaging.getInstance().getToken().addOnSuccessListener(this::onFCMTokenRetrieved);
    }

    public void onFCMTokenRetrieved(String token) {
        if (token != null && webView != null) {
            String js = "if(window.FirebaseService){ window.FirebaseService.registerFCMToken(window.Store ? window.Store.state.user.id : null, '" + token + "'); }";
            webView.evaluateJavascript(js, null);
        }
    }

    private void syncFCMTokenToWeb() {
        FirebaseMessaging.getInstance().getToken().addOnSuccessListener(this::onFCMTokenRetrieved);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessage == null) return;
            uploadMessage.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            uploadMessage = null;
        }
    }

    // Android Hardware Back Navigation
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
