package com.menumind

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.graphics.Bitmap
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.PixelCopy
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.BasicText
import androidx.compose.material.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.key
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.GraphicsLayerScope
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.layout.LayoutCoordinates
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.kyant.backdrop.Backdrop
import com.kyant.backdrop.catalog.components.LiquidBottomTab
import com.kyant.backdrop.catalog.components.LiquidBottomTabs
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

class LiquidTabBarManager : SimpleViewManager<ComposeView>() {

    private val selectedIndexState = mutableIntStateOf(0)
    private val isDarkThemeState = mutableStateOf(true)

    override fun getName(): String {
        return "LiquidTabBar"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ComposeView {
        val composeView = ComposeView(reactContext)
        composeView.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        composeView.setContent {
            val isDark = isDarkThemeState.value
            val textStyle = TextStyle(
                color = if (isDark) Color.White else Color.Black,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium
            )

            var backdropBitmap by remember { mutableStateOf<ImageBitmap?>(null) }
            val backdrop = remember(backdropBitmap) { BitmapBackdrop(backdropBitmap) }

            fun refreshBackdropSnapshot() {
                requestBackdropBitmap(composeView) { bitmap ->
                    backdropBitmap = bitmap.asImageBitmap()
                }
            }

            LaunchedEffect(Unit) {
                delay(260L)
                while (true) {
                    refreshBackdropSnapshot()
                    delay(850L)
                }
            }

            LaunchedEffect(selectedIndexState.intValue) {
                delay(220L)
                refreshBackdropSnapshot()
            }

            LaunchedEffect(isDark) {
                delay(60L)
                refreshBackdropSnapshot()
                delay(260L)
                refreshBackdropSnapshot()
            }

            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                key(isDark) {
                    LiquidBottomTabs(
                        selectedTabIndex = { selectedIndexState.intValue },
                        onTabSelected = { index ->
                            selectedIndexState.intValue = index
                            emitTabSelectedEvent(composeView, index)
                        },
                        backdrop = backdrop,
                        isDarkTheme = isDark,
                        tabsCount = 5,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        val tabsList = listOf(
                            TabInfo("Operations", DashboardIcon),
                            TabInfo("Approvals", FactCheckIcon),
                            TabInfo("Inventory", InventoryIcon),
                            TabInfo("Analytics", AnalyticsIcon),
                            TabInfo("AI Logs", PsychologyIcon)
                        )

                        tabsList.forEachIndexed { index, tab ->
                            val isActive = selectedIndexState.intValue == index
                            val activeColor = if (isDark) Color(0xFF00E5FF) else Color(0xFF00685F)
                            val inactiveColor = if (isDark) Color(0xFF80CBC4) else Color(0xFF546E7A)
                            val tint = if (isActive) activeColor else inactiveColor

                            LiquidBottomTab(
                                onClick = {
                                    selectedIndexState.intValue = index
                                    emitTabSelectedEvent(composeView, index)
                                }
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center
                                ) {
                                    Icon(
                                        imageVector = tab.icon,
                                        contentDescription = tab.label,
                                        tint = tint,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    BasicText(
                                        text = tab.label,
                                        style = textStyle.copy(color = tint)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        return composeView
    }

    private fun requestBackdropBitmap(view: ComposeView, onBitmapReady: (Bitmap) -> Unit) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (!view.isAttachedToWindow || view.windowToken == null) return

        val activity = view.context.findActivity() ?: return
        val decorView = activity.window.decorView
        if (!decorView.isAttachedToWindow || decorView.width <= 0 || decorView.height <= 0) return

        val width = view.width
        val height = view.height
        if (width <= 0 || height <= 0) return

        val viewLocation = IntArray(2)
        view.getLocationInWindow(viewLocation)

        // Copy the strip directly above the bar. It avoids feedback from copying the bar itself
        // while still giving the lens nearby app pixels to refract.
        val sourceTop = (viewLocation[1] - height).coerceAtLeast(0)
        val sourceRect = Rect(
            viewLocation[0],
            sourceTop,
            viewLocation[0] + width,
            sourceTop + height
        )
        if (!sourceRect.intersect(0, 0, decorView.width, decorView.height)) return

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        try {
            PixelCopy.request(
                activity.window,
                sourceRect,
                bitmap,
                { result ->
                    if (result == PixelCopy.SUCCESS) {
                        onBitmapReady(bitmap)
                    } else {
                        bitmap.recycle()
                    }
                },
                Handler(Looper.getMainLooper())
            )
        } catch (_: IllegalArgumentException) {
            bitmap.recycle()
        }
    }

    private tailrec fun Context.findActivity(): Activity? {
        return when (this) {
            is Activity -> this
            is ContextWrapper -> baseContext.findActivity()
            else -> null
        }
    }

    private class BitmapBackdrop(private val image: ImageBitmap?) : Backdrop {
        override val isCoordinatesDependent: Boolean = false

        override fun drawBackdrop(
            drawScope: DrawScope,
            density: Density,
            coordinates: LayoutCoordinates?,
            layerBlock: ((GraphicsLayerScope) -> Unit)?
        ) {
            val bitmap = image ?: return
            drawScope.drawImage(
                image = bitmap,
                dstSize = IntSize(
                    drawScope.size.width.roundToInt().coerceAtLeast(1),
                    drawScope.size.height.roundToInt().coerceAtLeast(1)
                ),
                alpha = 0.74f
            )
        }
    }

    @ReactProp(name = "selectedTabIndex")
    fun setSelectedTabIndex(view: ComposeView, index: Int) {
        selectedIndexState.intValue = index
    }

    @ReactProp(name = "isDarkTheme")
    fun setIsDarkTheme(view: ComposeView, isDarkTheme: Boolean) {
        isDarkThemeState.value = isDarkTheme
        view.post {
            view.invalidate()
            view.requestLayout()
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.of(
            "onTabSelected",
            MapBuilder.of("registrationName", "onTabSelected")
        )
    }

    private fun emitTabSelectedEvent(view: ComposeView, index: Int) {
        val event: WritableMap = Arguments.createMap()
        event.putInt("index", index)
        val reactContext = view.context as? ReactContext ?: return
        reactContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, "onTabSelected", event)
    }

    data class TabInfo(val label: String, val icon: ImageVector)

    companion object {
        val DashboardIcon = ImageVector.Builder(
            name = "Dashboard",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).path(fill = SolidColor(Color.Black)) {
            moveTo(3f, 13f)
            horizontalLineToRelative(8f)
            verticalLineTo(3f)
            horizontalLineTo(3f)
            close()
            moveTo(3f, 21f)
            horizontalLineToRelative(8f)
            verticalLineToRelative(-6f)
            horizontalLineTo(3f)
            close()
            moveTo(13f, 21f)
            horizontalLineToRelative(8f)
            verticalLineTo(11f)
            horizontalLineTo(13f)
            close()
            moveTo(13f, 3f)
            verticalLineToRelative(6f)
            horizontalLineToRelative(8f)
            verticalLineTo(3f)
            close()
        }.build()

        val FactCheckIcon = ImageVector.Builder(
            name = "FactCheck",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).path(fill = SolidColor(Color.Black)) {
            moveTo(12f, 2f)
            curveTo(6.48f, 2f, 2f, 6.48f, 2f, 12f)
            curveToRelative(0f, 5.52f, 4.48f, 10f, 10f, 10f)
            curveToRelative(5.52f, 0f, 10f, -4.48f, 10f, -10f)
            curveTo(22f, 6.48f, 17.52f, 2f, 12f, 2f)
            close()
            moveTo(10f, 17f)
            lineTo(5f, 12f)
            lineToRelative(1.41f, -1.41f)
            lineTo(10f, 13.34f)
            lineToRelative(7.59f, -7.59f)
            lineTo(19f, 7.17f)
            close()
        }.build()

        val InventoryIcon = ImageVector.Builder(
            name = "Inventory",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).path(fill = SolidColor(Color.Black)) {
            moveTo(20f, 2f)
            horizontalLineTo(4f)
            curveToRelative(-1f, 0f, -2f, .9f, -2f, 2f)
            verticalLineToRelative(16f)
            curveToRelative(0f, 1.1f, .9f, 2f, 2f, 2f)
            horizontalLineToRelative(16f)
            curveToRelative(1.1f, 0f, 2f, -.9f, 2f, -2f)
            verticalLineTo(4f)
            curveToRelative(0f, -1.1f, -.9f, -2f, -2f, -2f)
            close()
            moveTo(19f, 18f)
            horizontalLineTo(5f)
            verticalLineToRelative(-2f)
            horizontalLineToRelative(14f)
            close()
            moveTo(19f, 14f)
            horizontalLineTo(5f)
            verticalLineToRelative(-2f)
            horizontalLineToRelative(14f)
            close()
            moveTo(19f, 10f)
            horizontalLineTo(5f)
            verticalLineTo(6f)
            horizontalLineToRelative(14f)
            close()
        }.build()

        val AnalyticsIcon = ImageVector.Builder(
            name = "Analytics",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).path(fill = SolidColor(Color.Black)) {
            moveTo(19f, 3f)
            horizontalLineTo(5f)
            curveToRelative(-1.1f, 0f, -2f, .9f, -2f, 2f)
            verticalLineToRelative(14f)
            curveToRelative(0f, 1.1f, .9f, 2f, 2f, 2f)
            horizontalLineToRelative(14f)
            curveToRelative(1.1f, 0f, 2f, -.9f, 2f, -2f)
            verticalLineTo(5f)
            curveToRelative(0f, -1.1f, -.9f, -2f, -2f, -2f)
            close()
            moveTo(9f, 17f)
            horizontalLineTo(7f)
            verticalLineToRelative(-7f)
            horizontalLineToRelative(2f)
            close()
            moveTo(13f, 17f)
            horizontalLineToRelative(-2f)
            verticalLineTo(7f)
            horizontalLineToRelative(2f)
            close()
            moveTo(17f, 17f)
            horizontalLineToRelative(-2f)
            verticalLineToRelative(-4f)
            horizontalLineToRelative(2f)
            close()
        }.build()

        val PsychologyIcon = ImageVector.Builder(
            name = "Psychology",
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        ).path(fill = SolidColor(Color.Black)) {
            moveTo(12f, 8.04f)
            curveToRelative(-1.94f, 0f, -3.5f, 1.56f, -3.5f, 3.5f)
            curveToRelative(0f, 1.94f, 1.56f, 3.5f, 3.5f, 3.5f)
            curveToRelative(1.94f, 0f, 3.5f, -1.56f, 3.5f, -3.5f)
            curveToRelative(0f, -1.94f, -1.56f, -3.5f, -3.5f, -3.5f)
            close()
            moveTo(19f, 12f)
            curveToRelative(0f, -0.52f, -0.04f, -1.03f, -0.12f, -1.52f)
            lineToRelative(2.12f, -1.66f)
            curveToRelative(0.19f, -0.15f, 0.24f, -0.42f, 0.12f, -0.64f)
            lineToRelative(-2f, -3.46f)
            curveToRelative(-0.12f, -0.22f, -0.39f, -0.3f, -0.61f, -0.22f)
            lineToRelative(-2.49f, 1f)
            curveToRelative(-0.52f, -0.4f, -1.08f, -0.73f, -1.69f, -0.98f)
            lineToRelative(-0.38f, -2.65f)
            curveTo(13.9f, 1.76f, 13.68f, 1.5f, 13.4f, 1.5f)
            horizontalLineTo(9.6f)
            curveToRelative(-0.28f, 0f, -0.5f, 0.26f, -0.54f, 0.54f)
            lineToRelative(-0.38f, 2.65f)
            curveToRelative(-0.61f, 0.25f, -1.17f, 0.59f, -1.69f, 0.98f)
            lineToRelative(-2.49f, -1f)
            curveToRelative(-0.23f, -0.09f, -0.49f, 0f, -0.61f, 0.22f)
            lineToRelative(-2f, 3.46f)
            curveToRelative(-0.13f, 0.22f, -0.07f, 0.49f, 0.12f, 0.64f)
            lineToRelative(2.12f, 1.66f)
            curveToRelative(-0.08f, 0.49f, -0.12f, 1f, -0.12f, 1.52f)
            curveToRelative(0f, 0.52f, 0.04f, 1.03f, 0.12f, 1.52f)
            lineToRelative(-2.12f, 1.66f)
            curveToRelative(-0.19f, 0.15f, -0.24f, 0.42f, -0.12f, 0.64f)
            lineToRelative(2f, 3.46f)
            curveToRelative(0.12f, 0.22f, 0.39f, 0.3f, 0.61f, 0.22f)
            lineToRelative(2.49f, -1f)
            curveToRelative(0.52f, 0.4f, 1.08f, 0.73f, 1.69f, 0.98f)
            lineToRelative(0.38f, 2.65f)
            curveToRelative(0.04f, 0.28f, 0.26f, 0.54f, 0.54f, 0.54f)
            horizontalLineTo(13.4f)
            curveToRelative(0.28f, 0f, 0.5f, -0.26f, 0.54f, -0.54f)
            lineToRelative(0.38f, -2.65f)
            curveToRelative(0.61f, -0.25f, 1.17f, -0.59f, 1.69f, -0.98f)
            lineToRelative(2.49f, 1f)
            curveToRelative(0.23f, 0.09f, 0.49f, 0f, 0.61f, -0.22f)
            lineToRelative(2f, -3.46f)
            curveToRelative(0.12f, -0.22f, 0.07f, -0.49f, -0.12f, -0.64f)
            lineToRelative(-2.12f, -1.66f)
            curveToRelative(0.08f, -0.49f, 0.12f, -1f, 0.12f, -1.52f)
            close()
        }.build()
    }
}
