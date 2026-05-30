$ErrorActionPreference = 'Stop'

Write-Host "Setting environment variables..."
$env:JAVA_HOME = "C:\Java\jdk17"
$env:ANDROID_HOME = "C:\Android"
$env:Path += ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools"

# Handle Windows Path Space Bug by creating a temporary virtual drive (M:)
$originalDir = Get-Location
$virtualDrive = "M:"

Write-Host "Mounting $originalDir to virtual drive $virtualDrive to bypass MAX_PATH and space bugs..."
subst $virtualDrive "$originalDir"
if ($LASTEXITCODE -ne 0) {
    # If M: is taken, it might fail. In this script we assume M: is free.
    Write-Host "Warning: subst failed, maybe M: is already mapped? Proceeding locally..."
} else {
    Set-Location -Path "$virtualDrive\"
}

# Ask user if they want to clean/prebuild
$clean = "n" # "Do you want to run clean prebuild (y/N)?"
if ($clean -match "^[yY]") {
    Write-Host "Running prebuild..."
    npx expo prebuild --platform android --clean
}

Write-Host "Patching gradle.properties with 4GB JVM memory for Skia C++ compilation..."
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    # Remove existing jvmargs to avoid duplicates, then append our custom memory settings
    (Get-Content $gradleProps) -notmatch "org.gradle.jvmargs" | Set-Content $gradleProps
    Add-Content -Path $gradleProps -Value "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g"
}

Write-Host "Building APK..."
Set-Location -Path "android"
.\gradlew assembleRelease
Set-Location -Path ".."

Write-Host "Copying APKs..."
$apkOutput = "android\app\build\outputs\apk\release\app-release.apk"

# Create timestamped backup directory in the parent APK folder
$backupDir = "$originalDir\..\mobile apk\APK\Archive"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$latestApk = "$originalDir\..\mobile apk\APK\MenuMind-release-V2.apk"
$backupApk = "$backupDir\MenuMind-V2-$timestamp.apk"

Copy-Item -Path $apkOutput -Destination $latestApk -Force
Copy-Item -Path $apkOutput -Destination $backupApk -Force

# Cleanup virtual drive
if (Get-Location -match "^M:") {
    Set-Location -Path $originalDir
    Write-Host "Detaching virtual drive $virtualDrive..."
    subst $virtualDrive /D
}

Write-Host "Build Complete!"
Write-Host "Latest APK: $latestApk"
Write-Host "Backup APK: $backupApk"
