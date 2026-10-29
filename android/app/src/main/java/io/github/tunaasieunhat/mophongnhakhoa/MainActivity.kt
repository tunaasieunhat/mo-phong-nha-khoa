package io.github.tunaasieunhat.mophongnhakhoa

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * Mô Phỏng Nha Khoa (bản app Android).
 * Toàn bộ game nằm sẵn trong app (assets/www/index.html), chạy toàn màn hình, màn hình ngang, không cần mạng.
 * Có mạng thì app kiểm tra bản mới trên GitHub Releases và báo cho người chơi.
 */
class MainActivity : ComponentActivity() {

    private lateinit var web: WebView
    private var lastBack = 0L
    private var lastCheck = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val loader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            setBackgroundColor(Color.rgb(0x6F, 0xB3, 0x3A))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true          // lưu tiến trình game (localStorage)
            settings.mediaPlaybackRequiresUserGesture = false
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false
            settings.displayZoomControls = false
            settings.textZoom = 100
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            overScrollMode = WebView.OVER_SCROLL_NEVER
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                    loader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val url = request.url
                    if (url.host == HOST) return false
                    openLink(url)   // link tài liệu tham khảo mở bằng trình duyệt
                    return true
                }
            }
        }
        setContentView(web)
        hideBars()

        if (savedInstanceState != null) web.restoreState(savedInstanceState) else web.loadUrl(START)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Nút quay lại: đóng bảng đang mở trong game; nhấn 2 lần liên tiếp để thoát
                web.evaluateJavascript(BACK_JS) { r ->
                    if (r == "true") return@evaluateJavascript
                    val now = SystemClock.elapsedRealtime()
                    if (now - lastBack < 2000) finish()
                    else { lastBack = now; Toast.makeText(this@MainActivity, "Nhấn quay lại lần nữa để thoát", Toast.LENGTH_SHORT).show() }
                }
            }
        })
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideBars()
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
        val now = SystemClock.elapsedRealtime()
        if (lastCheck == 0L || now - lastCheck > 6 * 3600_000L) { lastCheck = now; checkUpdate() }
    }

    override fun onPause() {
        // Lưu game trước khi app bị tạm dừng
        web.evaluateJavascript("try{saveGame()}catch(e){}", null)
        web.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    private fun hideBars() {
        val c = WindowInsetsControllerCompat(window, window.decorView)
        c.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        c.hide(WindowInsetsCompat.Type.systemBars())
    }

    private fun openLink(uri: Uri) {
        try { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
        catch (e: ActivityNotFoundException) { Toast.makeText(this, "Không mở được liên kết", Toast.LENGTH_SHORT).show() }
    }

    /** Hỏi GitHub Releases xem có bản APK mới hơn không (tag dạng apk-<VERSION_CODE>). */
    private fun checkUpdate() {
        thread(isDaemon = true) {
            try {
                val con = URL(RELEASE_API).openConnection() as HttpURLConnection
                con.connectTimeout = 8000; con.readTimeout = 8000
                con.setRequestProperty("Accept", "application/vnd.github+json")
                if (con.responseCode != 200) return@thread
                val json = JSONObject(con.inputStream.bufferedReader().use { it.readText() })
                val code = json.optString("tag_name").removePrefix("apk-").toIntOrNull() ?: return@thread
                if (code <= BuildConfig.VERSION_CODE) return@thread
                val name = json.optString("name", "bản mới")
                runOnUiThread {
                    if (isFinishing) return@runOnUiThread
                    AlertDialog.Builder(this)
                        .setTitle("Có bản cập nhật")
                        .setMessage("$name đã sẵn sàng. Tải về và cài đè lên app hiện tại, tiến trình chơi vẫn được giữ.")
                        .setPositiveButton("Tải về") { _, _ -> openLink(Uri.parse(APK_URL)) }
                        .setNegativeButton("Để sau", null)
                        .show()
                }
            } catch (e: Exception) { /* không có mạng: bỏ qua */ }
        }
    }

    companion object {
        private const val HOST = "appassets.androidplatform.net"
        private const val START = "https://$HOST/assets/www/index.html"
        private const val RELEASE_API = "https://api.github.com/repos/tunaasieunhat/mo-phong-nha-khoa/releases/latest"
        private const val APK_URL = "https://github.com/tunaasieunhat/mo-phong-nha-khoa/releases/latest/download/MoPhongNhaKhoa.apk"
        /** Đóng bảng phác đồ / hộp thoại / màn điều trị nếu đang mở; trả về true nếu đã xử lý. */
        private const val BACK_JS = "(function(){try{" +
            "if(!document.getElementById('proto').hidden){closeProtocols();return true}" +
            "if(!document.getElementById('modal').hidden&&document.getElementById('mClose')){hideModal();return true}" +
            "if(!document.getElementById('treat').hidden&&document.getElementById('modal').hidden){leaveForLater();return true}" +
            "}catch(e){}return false})()"
    }
}
