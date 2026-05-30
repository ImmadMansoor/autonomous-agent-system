param(
    [string]$Version = "V32",
    [switch]$Install,
    [switch]$Full,
    [switch]$Clean,
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$sourceDir = Join-Path $scriptDir "MenuMind-LiquidGlass"
$mirrorDir = "C:\tmp\MMV19"
$apkDir = Join-Path $repoRoot "mobile apk\APK"
$protectedDir = Join-Path $repoRoot "_PROTECTED_RELEASES"
$buildLogDir = Join-Path $repoRoot "_build_logs"
$apkName = "MenuMind-release-$Version.apk"

$env:JAVA_HOME = "C:\Java\jdk17"
$env:ANDROID_HOME = "C:\Android"
$env:NODE_ENV = "production"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

function Invoke-RobocopyChecked {
    param([string[]]$ArgsList)

    $logPath = Join-Path $buildLogDir ("robocopy-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
    & robocopy @ArgsList "/LOG:$logPath"
    $code = $LASTEXITCODE
    if ($code -gt 7) {
        throw "Robocopy failed with exit code $code. Log: $logPath"
    }
    Write-Host "Robocopy log: $logPath"
}

if (-not (Test-Path -LiteralPath $sourceDir)) {
    throw "Source folder not found: $sourceDir"
}

if (-not (Test-Path -LiteralPath (Join-Path $sourceDir "node_modules"))) {
    Write-Host "Installing mobile dependencies with npm ci"
    Push-Location $sourceDir
    try {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed with exit code $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

New-Item -ItemType Directory -Force -Path $apkDir | Out-Null
New-Item -ItemType Directory -Force -Path $protectedDir | Out-Null
New-Item -ItemType Directory -Force -Path $buildLogDir | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $mirrorDir) | Out-Null

$mirrorHasNodeModules = Test-Path -LiteralPath (Join-Path $mirrorDir "node_modules")
$mirrorHasPackage = Test-Path -LiteralPath (Join-Path $mirrorDir "package.json")

if (-not $SkipSync) {
    $syncTimer = [System.Diagnostics.Stopwatch]::StartNew()

    if (-not $mirrorHasNodeModules -or -not $mirrorHasPackage) {
        Write-Host "First-time mirror setup: copying project to $mirrorDir"
        Invoke-RobocopyChecked @(
            $sourceDir,
            $mirrorDir,
            "/MIR",
            "/XD",
            (Join-Path $sourceDir ".git"),
            (Join-Path $sourceDir ".gradle"),
            (Join-Path $sourceDir ".expo"),
            (Join-Path $sourceDir "android\.gradle"),
            (Join-Path $sourceDir "android\.kotlin"),
            (Join-Path $sourceDir "android\build"),
            (Join-Path $sourceDir "android\app\build"),
            (Join-Path $sourceDir "android\app\.cxx"),
            "/R:1", "/W:1", "/MT:16", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS", "/NP"
        )

        Write-Host "Removing stale native build caches from first-time node_modules copy"
        Get-ChildItem -LiteralPath (Join-Path $mirrorDir "node_modules") -Filter "android" -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $buildDir = Join-Path $_.FullName "build"
            $cxxDir = Join-Path $_.FullName ".cxx"
            if (Test-Path -LiteralPath $buildDir) { Remove-Item -LiteralPath $buildDir -Recurse -Force -ErrorAction SilentlyContinue }
            if (Test-Path -LiteralPath $cxxDir) { Remove-Item -LiteralPath $cxxDir -Recurse -Force -ErrorAction SilentlyContinue }
        }
    } else {
        Write-Host "Incremental sync: source files only, keeping mirror node_modules and Gradle caches"
        Invoke-RobocopyChecked @(
            $sourceDir,
            $mirrorDir,
            "/MIR",
            "/XD",
            (Join-Path $sourceDir "node_modules"),
            (Join-Path $sourceDir ".git"),
            (Join-Path $sourceDir ".gradle"),
            (Join-Path $sourceDir ".expo"),
            (Join-Path $sourceDir "android\.gradle"),
            (Join-Path $sourceDir "android\.kotlin"),
            (Join-Path $sourceDir "android\build"),
            (Join-Path $sourceDir "android\app\build"),
            (Join-Path $sourceDir "android\app\.cxx"),
            "/R:1", "/W:1", "/MT:16", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS", "/NP"
        )
    }

    $syncTimer.Stop()
    Write-Host ("Sync finished in {0:n1}s" -f $syncTimer.Elapsed.TotalSeconds)
}

if ($Clean) {
    Write-Host "Clean requested: removing mirror Android build outputs"
    foreach ($path in @("android\.gradle", "android\.kotlin", "android\build", "android\app\build", "android\app\.cxx")) {
        $target = Join-Path $mirrorDir $path
        if (Test-Path -LiteralPath $target) {
            Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Clearing generated autolinking path caches"
foreach ($path in @("android\build\generated\autolinking", "android\app\build\generated\autolinking")) {
    $target = Join-Path $mirrorDir $path
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
    }
}

$gradleArgs = @(":app:assembleRelease", "--console=plain", "--no-daemon")
if (-not $Full) {
    $gradleArgs += @("-x", "lintVitalRelease", "-x", "lintVitalAnalyzeRelease", "-x", "lintVitalReportRelease")
}

$buildTimer = [System.Diagnostics.Stopwatch]::StartNew()
Push-Location (Join-Path $mirrorDir "android")
try {
    Write-Host "Building release APK from persistent mirror"
    & .\gradlew.bat @gradleArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
$buildTimer.Stop()

$builtApk = Join-Path $mirrorDir "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path -LiteralPath $builtApk)) {
    throw "Expected APK not found: $builtApk"
}

$latestApk = Join-Path $apkDir $apkName
$protectedApk = Join-Path $protectedDir $apkName
Copy-Item -LiteralPath $builtApk -Destination $latestApk -Force
Copy-Item -LiteralPath $builtApk -Destination $protectedApk -Force

Write-Host ("Build finished in {0:n1}s" -f $buildTimer.Elapsed.TotalSeconds)
Write-Host "APK: $latestApk"
Write-Host "Protected: $protectedApk"

if ($Install) {
    $adb = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
    if (-not (Test-Path -LiteralPath $adb)) {
        $adb = "C:\Users\Tayyab\AppData\Local\Android\Sdk\platform-tools\adb.exe"
    }

    & $adb install -r -d $latestApk
    if ($LASTEXITCODE -ne 0) {
        throw "adb install failed with exit code $LASTEXITCODE."
    }

    & $adb shell am force-stop com.menumind
    & $adb logcat -c
    & $adb shell am start -W -n com.menumind/.MainActivity
    Start-Sleep -Seconds 5
    & $adb shell pidof com.menumind
}
