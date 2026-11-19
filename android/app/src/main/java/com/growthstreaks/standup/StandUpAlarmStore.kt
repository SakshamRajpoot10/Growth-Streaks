package com.growthstreaks.standup

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

data class NativeAlarmItem(
    val triggerId: String,
    val triggerTimestamp: Long,
    val soundName: String,
    val title: String,
    val taskId: String,
    val strike: Int,
    val verificationType: String = "STANDARD"
)

object StandUpAlarmStore {
    private const val PREFS_NAME = "standup_alarms_persistence"
    private const val KEY_ALARMS = "active_alarms_json"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    @Synchronized
    fun saveAlarm(context: Context, alarm: NativeAlarmItem) {
        val current = getAllAlarms(context).toMutableList()
        current.removeAll { it.triggerId == alarm.triggerId }
        current.add(alarm)
        saveList(context, current)
    }

    @Synchronized
    fun removeAlarm(context: Context, triggerId: String) {
        val current = getAllAlarms(context).toMutableList()
        current.removeAll { it.triggerId == triggerId }
        saveList(context, current)
    }

    @Synchronized
    fun getAllAlarms(context: Context): List<NativeAlarmItem> {
        val jsonStr = getPrefs(context).getString(KEY_ALARMS, "[]") ?: "[]"
        val result = mutableListOf<NativeAlarmItem>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                result.add(
                    NativeAlarmItem(
                        triggerId = obj.getString("triggerId"),
                        triggerTimestamp = obj.getLong("triggerTimestamp"),
                        soundName = obj.optString("soundName", "gentle_chime"),
                        title = obj.optString("title", "Discipline Routine"),
                        taskId = obj.optString("taskId", ""),
                        strike = obj.optInt("strike", 1),
                        verificationType = obj.optString("verificationType", "STANDARD")
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return result
    }

    private fun saveList(context: Context, list: List<NativeAlarmItem>) {
        val array = JSONArray()
        for (item in list) {
            val obj = JSONObject()
            obj.put("triggerId", item.triggerId)
            obj.put("triggerTimestamp", item.triggerTimestamp)
            obj.put("soundName", item.soundName)
            obj.put("title", item.title)
            obj.put("taskId", item.taskId)
            obj.put("strike", item.strike)
            obj.put("verificationType", item.verificationType)
            array.put(obj)
        }
        getPrefs(context).edit().putString(KEY_ALARMS, array.toString()).apply()
    }
}
