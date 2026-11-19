package com.growthstreaks.standup

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import androidx.core.content.ContextCompat

class StandUpAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pendingResult = goAsync()

        // 1. Instantly wake up the physical screen if screen is off/locked
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            @Suppress("DEPRECATION")
            val screenWakeLock = powerManager?.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                PowerManager.ACQUIRE_CAUSES_WAKEUP or
                PowerManager.ON_AFTER_RELEASE,
                "StandUp:AlarmReceiverTurnScreenOn"
            )
            screenWakeLock?.acquire(15000L) // 15 seconds to wake physical display
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. Acquire static service wakelock to keep CPU alive during ring
        StandUpAlarmService.acquireWakeLock(context)

        try {
            // 3. Start high-priority Foreground Alarm Service for audio/vibration
            val serviceIntent = Intent(context, StandUpAlarmService::class.java).apply {
                putExtras(intent)
            }
            ContextCompat.startForegroundService(context, serviceIntent)

            // 4. Directly launch StandUpAlarmActivity over lock screen
            val activityIntent = Intent(context, StandUpAlarmActivity::class.java).apply {
                putExtras(intent)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            }
            context.startActivity(activityIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            pendingResult.finish()
        }
    }
}
