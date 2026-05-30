$ErrorActionPreference = 'Stop'

Write-Host "Setting environment variables..."
$env:JAVA_HOME = "C:\Java\jdk17"
$env:ANDROID_HOME = "C:\Android"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

$originalDir = "G:\Google Hackathon\autonomous-agent-system\MenuMind-V2-LiquidGlass"
$virtualDrive = "M:"

Write-Host "Detaching any existing virtual drive $virtualDrive..."
try {
    subst $virtualDrive /D | Out-Null
} catch {}

Write-Host "Mounting $originalDir to virtual drive $virtualDrive to completely bypass Windows path space bugs..."
subst $virtualDrive "$originalDir"

# Navigate to virtual drive M:
Set-Location -Path "$virtualDrive\"

Write-Host "Patching gradle.properties with 4GB JVM memory..."
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    (Get-Content $gradleProps) -notmatch "org.gradle.jvmargs" | Set-Content $gradleProps
    Add-Content -Path $gradleProps -Value "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g"
}

Write-Host "Performing CLEAN build inside virtual drive M: to purge C++ and JS build cache..."
Set-Location -Path "android"
.\gradlew clean --no-daemon

Write-Host "Building APK inside virtual drive M:\android with --no-daemon..."
.\gradlew assembleRelease --no-daemon
Set-Location -Path "$virtualDrive\"

Write-Host "Copying APKs..."
$apkOutput = "android\app\build\outputs\apk\release\app-release.apk"

$backupDir = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\Archive"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$latestApk = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\MenuMind-release-V29.apk"
$backupApk = "$backupDir\MenuMind-V29-$timestamp.apk"

Copy-Item -Path $apkOutput -Destination $latestApk -Force
Copy-Item -Path $apkOutput -Destination $backupApk -Force

# Navigate back to original directory and clean up subst
Set-Location -Path "G:\Google Hackathon\autonomous-agent-system"
Write-Host "Detaching virtual drive $virtualDrive..."
subst $virtualDrive /D

Write-Host "Build Complete!"
Write-Host "Latest APK: $latestApk"
Write-Host "Backup APK: $backupApk"
