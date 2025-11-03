# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor WebView Rules
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor Bridge
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Keep Capacitor Plugins
-keep @com.getcapacitor.Plugin class * {
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep class com.getcapacitor.plugin.** { *; }

# Keep Cordova
-keep class org.apache.cordova.** { *; }

# Uncomment this to preserve the line number information for
# debugging stack traces.
-keepattributes SourceFile,LineNumberTable

# Keep source file names and line numbers for better crash reports
-keepattributes *Annotation*,Signature,Exception
