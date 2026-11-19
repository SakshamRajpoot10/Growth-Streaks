package com.growthstreaks.standup

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class StandUpBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == Intent.ACTION_TIME_CHANGED ||
            action == Intent.ACTION_TIMEZONE_CHANGED
        ) {
            rescheduleAllPendingAlarms(context)
        }
    }

    private fun rescheduleAllPendingAlarms(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val now = System.currentTimeMillis()
        val allAlarms = StandUpAlarmStore.getAllAlarms(context)

        for (item in allAlarms) {
            if (item.triggerTimestamp > now) {
                try {
                    val triggerIntent = Intent(context, StandUpAlarmReceiver::class.java).apply {
                        this.action = "com.growthstreaks.standup.ALARM_TRIGGER"
                        putExtra("trigger_id", item.triggerId)
                        putExtra("sound_name", item.soundName)
                        putExtra("task_title", item.title)
                        putExtra("task_id", item.taskId)
                        putExtra("strike", item.strike)
                        putExtra("verification_type", item.verificationType)
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        item.triggerId.hashCode(),
                        triggerIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )

                    val clockInfo = AlarmManager.AlarmClockInfo(item.triggerTimestamp, pendingIntent)
                    alarmManager.setAlarmClock(clockInfo, pendingIntent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            } else {
                // Expired before or during reboot - cleanup
                StandUpAlarmStore.removeAlarm(context, item.triggerId)
            }
        }
    }
}
