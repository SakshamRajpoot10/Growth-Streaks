package com.growthstreaks.standup

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextClock
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class StandUpAlarmActivity : AppCompatActivity() {

    private var taskId: String = ""
    private var taskTitle: String = ""
    private var strike: Int = 1
    private var verificationType: String = "STANDARD"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Ensure display turns on and displays directly over the locked screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }

        @Suppress("DEPRECATION")
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        )

        taskId = intent?.getStringExtra("task_id") ?: ""
        taskTitle = intent?.getStringExtra("task_title") ?: "Discipline Routine"
        strike = intent?.getIntExtra("strike", 1) ?: 1
        verificationType = intent?.getStringExtra("verification_type") ?: "STANDARD"

        buildProgrammaticUI()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
    }

    private fun buildProgrammaticUI() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#090A0F")) // Deep dark discipline AMOLED background
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(40, 70, 40, 50)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // Top Tag
        val topBadge = TextView(this).apply {
            text = "⏰ STANDUP DISCIPLINE ALARM"
            setTextColor(Color.parseColor("#6366F1"))
            textSize = 12f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 16)
        }
        root.addView(topBadge)

        // Live Auto-Updating Clock (TextClock updates automatically each second)
        val textClock = TextClock(this).apply {
            format12Hour = "hh:mm a"
            format24Hour = "HH:mm"
            setTextColor(Color.WHITE)
            textSize = 46f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 6)
        }
        root.addView(textClock)

        // Strike Indicator
        val strikeText = TextView(this).apply {
            text = when (strike) {
                1 -> "Strike 1/3: 5-Minute Advance Call"
                2 -> "Strike 2/3: 3-Minute Urgency Notice"
                else -> "Strike 3/3: Final Call — Routine Starts Now!"
            }
            setTextColor(if (strike == 3) Color.parseColor("#EF4444") else Color.parseColor("#F59E0B"))
            textSize = 14f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 28)
        }
        root.addView(strikeText)

        // Task Title Banner
        val titleText = TextView(this).apply {
            text = taskTitle
            setTextColor(Color.WHITE)
            textSize = 26f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 12)
        }
        root.addView(titleText)

        // Mode-Specific Explanatory Subtitle
        val isWakeUp = verificationType == "WAKE_UP_VERIFICATION"
        val subText = TextView(this).apply {
            text = if (isWakeUp) {
                "Wake-Up Verification: Stand upright for 30 seconds with front camera to dismiss."
            } else {
                "Standard Routine: Confirm execution to protect your streak, or skip."
            }
            setTextColor(Color.parseColor("#9CA3AF"))
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(16, 0, 16, 40)
        }
        root.addView(subText)

        // Flexible spacer to push action area cleanly toward the bottom
        val spacer = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )
        }
        root.addView(spacer)

        // Render Distinct Action Experiences
        if (isWakeUp) {
            // ==========================================
            // WAKE-UP ALARM: 30-Second Camera Verification Flow
            // ==========================================
            val btnVerify = Button(this).apply {
                text = "📸 START 30s CAMERA VERIFICATION"
                setTextColor(Color.BLACK)
                textSize = 15f
                typeface = Typeface.DEFAULT_BOLD

                val bg = GradientDrawable().apply {
                    setColor(Color.parseColor("#10B981")) // Emerald Green
                    cornerRadius = 24f
                }
                background = bg
                setPadding(20, 36, 20, 36)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, 16)
                }
                setOnClickListener {
                    StandUpAlarmService.stopAlarm(this@StandUpAlarmActivity)

                    // Request keyguard dismissal so user lands on camera verification screen
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                        val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                        km?.requestDismissKeyguard(this@StandUpAlarmActivity, null)
                    }

                    val mainIntent = Intent(this@StandUpAlarmActivity, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                                Intent.FLAG_ACTIVITY_SINGLE_TOP
                        putExtra("standup_alarm_active", true)
                        putExtra("standup_task_id", taskId)
                        putExtra("standup_strike", strike)
                        putExtra("standup_verification_type", "WAKE_UP_VERIFICATION")
                    }
                    startActivity(mainIntent)
                    finish()
                }
            }
            root.addView(btnVerify)

            val btnSkip = Button(this).apply {
                text = "✕ Skip Routine (Record Missed)"
                setTextColor(Color.parseColor("#EF4444"))
                textSize = 14f
                typeface = Typeface.DEFAULT_BOLD
                setBackgroundColor(Color.TRANSPARENT)
                setPadding(20, 20, 20, 20)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                setOnClickListener {
                    StandUpAlarmService.stopAlarm(this@StandUpAlarmActivity)
                    finish()
                }
            }
            root.addView(btnSkip)
        } else {
            // ==========================================
            // STANDARD ALARM: Dual Actions (Done vs Skip), NO CAMERA
            // ==========================================
            val btnDone = Button(this).apply {
                text = "✓ DONE — I'M DOING IT!"
                setTextColor(Color.BLACK)
                textSize = 15f
                typeface = Typeface.DEFAULT_BOLD

                val bg = GradientDrawable().apply {
                    setColor(Color.parseColor("#10B981")) // Emerald Green
                    cornerRadius = 24f
                }
                background = bg
                setPadding(20, 36, 20, 36)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, 16)
                }
                setOnClickListener {
                    StandUpAlarmService.stopAlarm(this@StandUpAlarmActivity)

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                        val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                        km?.requestDismissKeyguard(this@StandUpAlarmActivity, null)
                    }

                    // Open MainActivity to record completed task log and update streak
                    val mainIntent = Intent(this@StandUpAlarmActivity, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                                Intent.FLAG_ACTIVITY_SINGLE_TOP
                        putExtra("standup_alarm_completed", true)
                        putExtra("standup_task_id", taskId)
                        putExtra("standup_strike", strike)
                    }
                    startActivity(mainIntent)
                    finish()
                }
            }
            root.addView(btnDone)

            val btnSkip = Button(this).apply {
                text = "✕ Skip Routine (Missed)"
                setTextColor(Color.parseColor("#9CA3AF"))
                textSize = 14f
                typeface = Typeface.DEFAULT_BOLD
                setBackgroundColor(Color.TRANSPARENT)
                setPadding(20, 20, 20, 20)
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                setOnClickListener {
                    StandUpAlarmService.stopAlarm(this@StandUpAlarmActivity)
                    finish()
                }
            }
            root.addView(btnSkip)
        }

        setContentView(root)
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
