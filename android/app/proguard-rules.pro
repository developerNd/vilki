# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Keep React Native Paper components
-keep class com.google.android.material.** { *; }

# Keep vector icons
-keep class com.oblador.vectoricons.** { *; }

# Keep navigation components
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep maps components
-keep class com.airbnb.android.react.maps.** { *; }

# Keep permissions
-keep class com.zoontek.rnpermissions.** { *; }

# Keep geolocation
-keep class com.agontuk.rnfusedlocation.** { *; }

# Keep ratings
-keep class com.stars.rating.** { *; }

# Keep toast
-keep class com.toast.** { *; }

# Keep modal
-keep class com.reactnativecommunity.modal.** { *; }

# Keep elements
-keep class com.reactnativeelements.** { *; }

# Keep axios
-keep class com.facebook.react.modules.network.** { *; }

# Keep gesture handler
-keep class com.swmansion.gesturehandler.** { *; }

# Keep safe area context
-keep class com.th3rdwave.safeareacontext.** { *; }
