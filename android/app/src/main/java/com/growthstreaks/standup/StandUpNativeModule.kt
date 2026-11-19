package com.growthstreaks.standup

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.fitness.FitnessLocal
import com.google.android.gms.fitness.data.LocalDataType
import com.google.android.gms.fitness.request.LocalDataReadRequest
import java.util.Calendar
import java.util.concurrent.TimeUnit

class StandUpNativeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), SensorEventListener {

    override fun getName(): String = "StandUpNativeModule"

    private var sensorManager: SensorManager? = null
    private var stepCounterSensor: Sensor? = null
    private var liveSensorBaseline: Int = -1
    private var isSensorRegistered = false

    private fun sendEvent(eventName: String, data: Any) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, data)
        }
    }

    // ==========================================
    // 1. ALARM ENGINE APIS
    // ==========================================

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            if (alarmManager == null) {
                promise.resolve(false)
                return
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                promise.resolve(alarmManager.canScheduleExactAlarms())
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun canUseFullScreenIntent(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                val nm = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as? android.app.NotificationManager
                promise.resolve(nm?.canUseFullScreenIntent() ?: true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun openFullScreenIntentSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                val intent = Intent(android.provider.Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
                    data = android.net.Uri.parse("package:" + reactContext.packageName)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun scheduleAlarm(
        triggerId: String,
        triggerTimestamp: Double,
        soundName: String,
        title: String,
        taskId: String,
        strike: Int,
        verificationType: String,
        promise: Promise
    ) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            if (alarmManager == null) {
                promise.reject("ERR_NO_ALARM_MGR", "AlarmManager not available")
                return
            }

            val triggerMs = triggerTimestamp.toLong()

            // 1. Persist alarm details natively for reboot recovery
            StandUpAlarmStore.saveAlarm(
                reactContext,
                NativeAlarmItem(
                    triggerId = triggerId,
                    triggerTimestamp = triggerMs,
                    soundName = soundName,
                    title = title,
                    taskId = taskId,
                    strike = strike,
                    verificationType = verificationType
                )
            )

            // 2. Schedule exact alarm with AlarmManager
            val intent = Intent(reactContext, StandUpAlarmReceiver::class.java).apply {
                action = "com.growthstreaks.standup.ALARM_TRIGGER"
                putExtra("trigger_id", triggerId)
                putExtra("sound_name", soundName)
                putExtra("task_title", title)
                putExtra("task_id", taskId)
                putExtra("strike", strike)
                putExtra("verification_type", verificationType)
            }

            val requestCode = triggerId.hashCode()
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val clockInfo = AlarmManager.AlarmClockInfo(triggerMs, pendingIntent)
            alarmManager.setAlarmClock(clockInfo, pendingIntent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_SCHEDULE_ALARM", e.message, e)
        }
    }

    @ReactMethod
    fun cancelAlarm(triggerId: String, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            val intent = Intent(reactContext, StandUpAlarmReceiver::class.java).apply {
                action = "com.growthstreaks.standup.ALARM_TRIGGER"
            }
            val requestCode = triggerId.hashCode()
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                requestCode,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )

            if (pendingIntent != null && alarmManager != null) {
                alarmManager.cancel(pendingIntent)
                pendingIntent.cancel()
            }

            // Remove from native reboot storage
            StandUpAlarmStore.removeAlarm(reactContext, triggerId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_ALARM", e.message, e)
        }
    }

    @ReactMethod
    fun stopAlarmService(promise: Promise) {
        try {
            StandUpAlarmService.stopAlarm(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_STOP_ALARM", e.message, e)
        }
    }

    @ReactMethod
    fun isAlarmRinging(promise: Promise) {
        promise.resolve(StandUpAlarmService.isRinging)
    }

    // ==========================================
    // 2. FITNESS RECORDING API (NO PERMANENT NOTIFICATION)
    // ==========================================

    @ReactMethod
    fun subscribeRecordingApi(promise: Promise) {
        try {
            val client = FitnessLocal.getLocalRecordingClient(reactContext)
            client.subscribe(LocalDataType.TYPE_STEP_COUNT_DELTA)
                .addOnSuccessListener {
                    promise.resolve(true)
                }
                .addOnFailureListener { e ->
                    promise.reject("ERR_RECORDING_SUBSCRIBE", e.message, e)
                }
        } catch (e: Exception) {
            promise.reject("ERR_RECORDING_API", e.message, e)
        }
    }

    @ReactMethod
    fun readTodayRecordingSteps(promise: Promise) {
        try {
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val readRequest = LocalDataReadRequest.Builder()
                .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
                .read(LocalDataType.TYPE_STEP_COUNT_DELTA)
                .build()

            val client = FitnessLocal.getLocalRecordingClient(reactContext)
            client.readData(readRequest)
                .addOnSuccessListener { response ->
                    val dataSet = response.getDataSet(LocalDataType.TYPE_STEP_COUNT_DELTA)
                    var totalSteps = 0
                    if (dataSet != null) {
                        for (dp in dataSet.dataPoints) {
                            for (field in dp.dataType.fields) {
                                totalSteps += dp.getValue(field).asInt()
                            }
                        }
                    }
                    promise.resolve(totalSteps)
                }
                .addOnFailureListener { e ->
                    promise.reject("ERR_READ_STEPS", e.message, e)
                }
        } catch (e: Exception) {
            promise.reject("ERR_READ_STEPS", e.message, e)
        }
    }

    @ReactMethod
    fun readHourlyRecordingSteps(promise: Promise) {
        try {
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val readRequest = LocalDataReadRequest.Builder()
                .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
                .read(LocalDataType.TYPE_STEP_COUNT_DELTA)
                .build()

            val client = FitnessLocal.getLocalRecordingClient(reactContext)
            client.readData(readRequest)
                .addOnSuccessListener { response ->
                    val dataSet = response.getDataSet(LocalDataType.TYPE_STEP_COUNT_DELTA)
                    val hourlyArray = IntArray(24) { 0 }

                    if (dataSet != null) {
                        val cal = Calendar.getInstance()
                        for (dp in dataSet.dataPoints) {
                            val dpTime = dp.getStartTime(TimeUnit.MILLISECONDS)
                            cal.timeInMillis = dpTime
                            val hour = cal.get(Calendar.HOUR_OF_DAY)
                            for (field in dp.dataType.fields) {
                                val steps = dp.getValue(field).asInt()
                                if (hour in 0..23) {
                                    hourlyArray[hour] += steps
                                }
                            }
                        }
                    }

                    val map: WritableMap = Arguments.createMap()
                    for (h in 0..23) {
                        map.putInt(h.toString(), hourlyArray[h])
                    }
                    promise.resolve(map)
                }
                .addOnFailureListener { e ->
                    promise.reject("ERR_HOURLY_STEPS", e.message, e)
                }
        } catch (e: Exception) {
            promise.reject("ERR_HOURLY_STEPS", e.message, e)
        }
    }

    // ==========================================
    // 3. LIVE FOREGROUND SENSOR TRACKER (NO PERMANENT NOTIFICATION)
    // ==========================================

    @ReactMethod
    fun startLiveSensorTracker(promise: Promise) {
        try {
            if (sensorManager == null) {
                sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            }
            if (stepCounterSensor == null) {
                stepCounterSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
            }

            if (stepCounterSensor != null && !isSensorRegistered) {
                liveSensorBaseline = -1
                isSensorRegistered = sensorManager?.registerListener(
                    this,
                    stepCounterSensor,
                    SensorManager.SENSOR_DELAY_UI
                ) ?: false
                promise.resolve(isSensorRegistered)
            } else {
                promise.resolve(isSensorRegistered)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun stopLiveSensorTracker(promise: Promise) {
        try {
            if (isSensorRegistered) {
                sensorManager?.unregisterListener(this)
                isSensorRegistered = false
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || event.sensor.type != Sensor.TYPE_STEP_COUNTER) return
        val rawCount = event.values[0].toInt()
        if (liveSensorBaseline == -1) {
            liveSensorBaseline = rawCount
        }
        val liveSessionSteps = maxOf(0, rawCount - liveSensorBaseline)
        sendEvent("onLiveSensorStepUpdate", liveSessionSteps)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
