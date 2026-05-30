$ErrorActionPreference = 'Stop'

Write-Host "Setting environment variables..."
$env:JAVA_HOME = "C:\Java\jdk17"
$env:ANDROID_HOME = "C:\Android"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

$sourceDir = "G:\Google Hackathon\autonomous-agent-system\MenuMind-V2-LiquidGlass"
$tempDir = "G:\MenuMind-LiquidGlass"

# Create temp directory if it doesn't exist (or reuse it for fast incremental mirroring)
if (-not (Test-Path $tempDir)) {
    Write-Host "Creating clean space-free temporary directory: $tempDir..."
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
} else {
    Write-Host "Reusing existing temporary directory $tempDir for fast incremental mirroring..."
}

Write-Host "Fast mirroring source to space-free temporary path using Robocopy..."
# Robocopy /MIR including node_modules to completely bypass npm install downloading!
if (Test-Path "$tempDir\node_modules") {
    Write-Host "node_modules is already mirrored. Skipping node_modules from Robocopy scanning to compile instantly..."
    robocopy "$sourceDir" "$tempDir" /MIR /XD .git .gradle .expo node_modules android\.gradle android\app\build /NJH /NJS /NDL /NC /NS /NP | Out-Null
    
    Write-Host "Manually syncing patched Reanimated files..."
    $files = @(
        "node_modules\react-native-reanimated\android\src\reactNativeVersionPatch\BorderRadiiDrawableUtils\latest\com\swmansion\reanimated\BorderRadiiDrawableUtils.java",
        "node_modules\react-native-reanimated\android\src\main\java\com\swmansion\reanimated\ReanimatedPackage.java",
        "node_modules\react-native-reanimated\src\createAnimatedComponent\createAnimatedComponent.tsx",
        "node_modules\react-native-reanimated\lib\module\createAnimatedComponent\createAnimatedComponent.js"
    )
    
    foreach ($file in $files) {
        $destFile = "$tempDir\$file"
        $parent = Split-Path -Path $destFile -Parent
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path "$sourceDir\$file" -Destination $destFile -Force
    }
} else {
    Write-Host "First-time copy: fast mirroring full source (including node_modules) using Robocopy..."
    robocopy "$sourceDir" "$tempDir" /MIR /XD .git .gradle .expo android\.gradle android\app\build /NJH /NJS /NDL /NC /NS /NP | Out-Null
    
    Write-Host "Purging stale JNI C++ build and .cxx caches from node_modules..."
    Get-ChildItem -Path "$tempDir\node_modules" -Filter "android" -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $androidDir = $_.FullName
        $cxxDir = Join-Path $androidDir ".cxx"
        $buildDir = Join-Path $androidDir "build"
        if (Test-Path $cxxDir) { Remove-Item -Path $cxxDir -Recurse -Force -ErrorAction SilentlyContinue }
        if (Test-Path $buildDir) { Remove-Item -Path $buildDir -Recurse -Force -ErrorAction SilentlyContinue }
    }
}

Write-Host "Successfully mirrored project to space-free path: $tempDir"

Write-Host "Purging stale Gradle build and .gradle caches from android folder..."
$androidGradle = Join-Path $tempDir "android\.gradle"
$androidKotlin = Join-Path $tempDir "android\.kotlin"
$androidBuild = Join-Path $tempDir "android\build"
$appBuild = Join-Path $tempDir "android\app\build"
if (Test-Path $androidGradle) { Remove-Item -Path $androidGradle -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path $androidKotlin) { Remove-Item -Path $androidKotlin -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path $androidBuild) { Remove-Item -Path $androidBuild -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path $appBuild) { Remove-Item -Path $appBuild -Recurse -Force -ErrorAction SilentlyContinue }

# Navigate to space-free temporary path
Set-Location -Path $tempDir

Write-Host "Patching gradle.properties with 4GB JVM memory..."
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    (Get-Content $gradleProps) -notmatch "org.gradle.jvmargs" | Set-Content $gradleProps
    Add-Content -Path $gradleProps -Value "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g"
}

Write-Host "Performing clean build of Kotlin Compose backdrop filter APK..."
Set-Location -Path "android"
.\gradlew clean --no-daemon
.\gradlew assembleRelease --no-daemon
Set-Location -Path $tempDir

Write-Host "Copying successfully compiled V30 APK..."
$apkOutput = "android\app\build\outputs\apk\release\app-release.apk"

$backupDir = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\Archive"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$latestApk = "G:\Google Hackathon\autonomous-agent-system\mobile apk\APK\MenuMind-release-V30.apk"
$backupApk = "$backupDir\MenuMind-V30-$timestamp.apk"

Copy-Item -Path $apkOutput -Destination $latestApk -Force
Copy-Item -Path $apkOutput -Destination $backupApk -Force

# Navigate back to original directory and remove temporary folder
Set-Location -Path "G:\Google Hackathon\autonomous-agent-system"
Write-Host "Cleaning up temporary space-free folder $tempDir..."
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Build Complete!"
Write-Host "Latest APK: $latestApk"
Write-Host "Backup APK: $backupApk"
