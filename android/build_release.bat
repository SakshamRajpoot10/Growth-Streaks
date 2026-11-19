@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio1\jbr"
set "ANDROID_HOME=C:\Users\315082\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0"
call .\gradlew.bat assembleRelease --stacktrace
