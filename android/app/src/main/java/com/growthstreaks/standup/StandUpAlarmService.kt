package com.growthstreaks.standup

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat

class StandUpAlarmService : Service() {

    companion object {
        const val CHANNEL_ID = "standup_native_alarm_v4"
        const val NOTIFICATION_ID = 2001
        var isRinging = false
            private set
        private var activeServiceInstance: StandUpAlarmService? = null
        private var staticWakeLock: PowerManager.WakeLock? = null

        @Synchronized
        fun acquireWakeLock(context: Context) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager

            // 1. Wake physical screen immediately upon alarm trigger
            try {
                @Suppress("DEPRECATION")
                val screenLock = powerManager?.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                    PowerManager.ACQUIRE_CAUSES_WAKEUP or
                    PowerManager.ON_AFTER_RELEASE,
                    "StandUp:AlarmServiceScreenWakeLock"
                )
                screenLock?.acquire(15000L)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // 2. Ensure CPU remains awake during ringing sequence
            if (staticWakeLock == null) {
                staticWakeLock = powerManager?.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "StandUp:AlarmServiceStaticWakeLock"
                )?.apply {
                    setReferenceCounted(false)
                }
            }
            staticWakeLock?.acquire(10 * 60 * 1000L) // 10 minutes timeout
        }

        @Synchronized
        fun releaseWakeLock() {
            try {
                if (staticWakeLock?.isHeld == true) {
                    staticWakeLock?.release()
                }
                staticWakeLock = null
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun stopAlarm(context: Context) {
            activeServiceInstance?.stopSelf()
            val stopIntent = Intent(context, StandUpAlarmService::class.java)
            context.stopService(stopIntent)
            releaseWakeLock()
            isRinging = false
        }
    }

    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private val autoDismissHandler = Handler(Looper.getMainLooper())
    private val autoDismissRunnable = Runnable {
        // Auto-stop after 5 minutes (300 seconds) of unanswered ringing
        stopAlarm(this)
    }

    override fun onCreate() {
        super.onCreate()
        activeServiceInstance = this
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        isRinging = true
        val soundName = intent?.getStringExtra("sound_name") ?: "gentle_chime"
        val taskTitle = intent?.getStringExtra("task_title") ?: "Discipline Routine"
        val taskId = intent?.getStringExtra("task_id") ?: ""
        val strike = intent?.getIntExtra("strike", 1) ?: 1
        val verificationType = intent?.getStringExtra("verification_type") ?: "STANDARD"

        val notification = buildAlarmNotification(taskTitle, taskId, strike, verificationType)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        startAudioPlayback(soundName)
        startVibration()

        // 5-Minute Ringing Window: If ignored for 5 min, stop sound & release wakelock
        autoDismissHandler.removeCallbacks(autoDismissRunnable)
        autoDismissHandler.postDelayed(autoDismissRunnable, 5 * 60 * 1000L)

        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            val channel = NotificationChannel(
                CHANNEL_ID,
                "StandUp Active Alarm",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High priority alarm ringing screen"
                setBypassDnd(true)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 400, 800)
                setSound(null, audioAttributes)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildAlarmNotification(
        taskTitle: String,
        taskId: String,
        strike: Int,
        verificationType: String
    ): Notification {
        val fullScreenIntent = Intent(this, StandUpAlarmActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            putExtra("task_title", taskTitle)
            putExtra("task_id", taskId)
            putExtra("strike", strike)
            putExtra("verification_type", verificationType)
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            taskId.hashCode(),
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val subtext = if (verificationType == "WAKE_UP_VERIFICATION") {
            "Call $strike/3: 30s camera verification to dismiss!"
        } else {
            "Call $strike/3: Tap or swipe to confirm routine execution!"
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("⏰ StandUp Alarm: $taskTitle")
            .setContentText(subtext)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(pendingIntent, true)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .build()
    }

    private fun startAudioPlayback(soundName: String) {
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()

            val resId = resources.getIdentifier(soundName, "raw", packageName).let {
                if (it != 0) it else resources.getIdentifier("gentle_chime", "raw", packageName)
            }

            if (resId != 0) {
                mediaPlayer = MediaPlayer.create(this, resId).apply {
                    isLooping = true
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    setVolume(1.0f, 1.0f)
                    start()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startVibration() {
        try {
            vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            val pattern = longArrayOf(0, 800, 400, 800)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(pattern, 0)
                vibrator?.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        isRinging = false
        activeServiceInstance = null
        autoDismissHandler.removeCallbacks(autoDismissRunnable)

        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            vibrator?.cancel()
            vibrator = null
        } catch (e: Exception) {
            e.printStackTrace()
        }

        releaseWakeLock()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
