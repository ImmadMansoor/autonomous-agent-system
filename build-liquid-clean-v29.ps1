$ErrorActionPreference = 'Stop'

Write-Host "Setting environment variables..."
$env:JAVA_HOME = "C:\Java\jdk17"
$env:ANDROID_HOME = "C:\Android"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

$originalDir = "G:\Google Hackathon\autonomous-agent-system\MenuMind-V2-LiquidGlass"
$junctionPath = "G:\MM-Temp"

# Recreate junction to ensure freshness
if (Test-Path $junctionPath) {
    Write-Host "Removing existing junction $junctionPath..."
    cmd /c rmdir $junctionPath
}

Write-Host "Creating directory junction $junctionPath -> $originalDir..."
New-Item -ItemType Junction -Path $junctionPath -Value $originalDir | Out-Null

Write-Host "Patching gradle.properties with 4GB JVM memory..."
$gradleProps = "$junctionPath\android\gradle.properties"
if (Test-Path $gradleProps) {
    # Remove existing jvmargs to avoid duplicates, then append our custom memory settings
    (Get-Content $gradleProps) -notmatch "org.gradle.jvmargs" | Set-Content $gradleProps
    Add-Content -Path $gradleProps -Value "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g"
}

Write-Host "Performing CLEAN Gradle Build inside short-path junction $junctionPath\android to purge cached JS bundles..."
Set-Location -Path "$junctionPath\android"
.\gradlew clean

Write-Host "Building APK inside short-path junction $junctionPath\android..."
.\gradlew assembleRelease
Set-Location -Path "G:\Google Hackathon\autonomous-agent-system"

Write-Host "Copying APKs..."
$apkOutput = "$junctionPath\android\app\build\outputs\apk\release\app-release.apk"

$backupDir = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\Archive"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$latestApk = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\MenuMind-release-V29.apk"
$backupApk = "$backupDir\MenuMind-V29-$timestamp.apk"

Copy-Item -Path $apkOutput -Destination $latestApk -Force
Copy-Item -Path $apkOutput -Destination $backupApk -Force

# Cleanup junction
Write-Host "Removing directory junction $junctionPath..."
cmd /c rmdir $junctionPath

Write-Host "Build Complete!"
Write-Host "Latest APK: $latestApk"
Write-Host "Backup APK: $backupApk"
