package io.antigravity.fintech;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "FintechFCM";
    public static final String CHANNEL_TRANSACTIONS = "transactions";
    public static final String CHANNEL_YIELD_ALERTS = "yield_alerts";
    public static final String CHANNEL_SECURITY = "security";

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed FCM registration token: " + token);
        // Persist token or transmit to backend/Firestore
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        String title = "Antigravity Fintech Alert";
        String messageBody = "";
        String channelId = CHANNEL_TRANSACTIONS;

        if (remoteMessage.getNotification() != null) {
          if (remoteMessage.getNotification().getTitle() != null) {
            title = remoteMessage.getNotification().getTitle();
          }
          if (remoteMessage.getNotification().getBody() != null) {
            messageBody = remoteMessage.getNotification().getBody();
          }
        }

        if (remoteMessage.getData().size() > 0) {
            if (remoteMessage.getData().containsKey("title")) {
                title = remoteMessage.getData().get("title");
            }
            if (remoteMessage.getData().containsKey("body")) {
                messageBody = remoteMessage.getData().get("body");
            }
            if (remoteMessage.getData().containsKey("channelId")) {
                channelId = remoteMessage.getData().get("channelId");
            }
        }

        sendNotification(title, messageBody, channelId);
    }

    private void sendNotification(String title, String messageBody, String channelId) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelId)
                        .setSmallIcon(R.drawable.ic_notification)
                        .setContentTitle(title)
                        .setContentText(messageBody)
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Notification Channels (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    channelId.toUpperCase() + " Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Real-time notifications for " + channelId);
            channel.enableVibration(true);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }

        if (notificationManager != null) {
            notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
        }
    }
}
