param(
    [int]$Port = 8090,
    [switch]$KeepServerRunning
)

$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$serverScript = Join-Path $projectRoot "server/server.ps1"
$baseUrl = "http://localhost:$Port"
$adoptionStorage = Join-Path $projectRoot "storage/adoption-applications.json"
$helpStorage = Join-Path $projectRoot "storage/help-requests.json"

function Wait-Server {
    param(
        [Parameter(Mandatory = $true)][string]$Url
    )

    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        try {
            Invoke-WebRequest "$Url/" -UseBasicParsing | Out-Null
            return
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }

    throw "Server did not become ready in time."
}

$serverProcess = Start-Process `
    -FilePath "powershell.exe" `
    -ArgumentList @(
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $serverScript,
        "-Port",
        $Port,
        "-ProjectRoot",
        $projectRoot
    ) `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -PassThru

try {
    Write-Host "Smoke test: starting temporary server on $baseUrl"
    Wait-Server -Url $baseUrl
    Write-Host "Server is ready."
    Write-Host ""

    $paths = @(
        "/",
        "/about/",
        "/news/",
        "/catalog/",
        "/help/",
        "/adopt/",
        "/animal/?slug=luna",
        "/assets/styles/base.css",
        "/assets/scripts/app.js",
        "/api/site",
        "/api/news",
        "/api/animals"
    )

    Write-Host "Checking GET routes:"

    foreach ($path in $paths) {
        $response = Invoke-WebRequest "$baseUrl$path" -UseBasicParsing

        if ($response.StatusCode -ne 200) {
            throw "Expected HTTP 200 for $path but received $($response.StatusCode)."
        }

        Write-Host "  [OK] $path"
    }

    $site = Invoke-RestMethod "$baseUrl/api/site"

    if ([string]::IsNullOrWhiteSpace($site.brand.name)) {
        throw "Unexpected payload from /api/site."
    }

    Write-Host ""
    Write-Host "Checking form endpoints:"

    $adoptionResult = Invoke-RestMethod `
        -Uri "$baseUrl/api/adoption-applications" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Smoke Test"
            phone = "+7 (900) 000-00-01"
            email = "smoke@example.ru"
            petType = "cat"
            housing = "flat"
            experience = "had-pets"
            message = "Smoke test adoption payload"
            agreement = "yes"
            sourcePage = "/tests/smoke"
        } | ConvertTo-Json)

    if (-not $adoptionResult.ok) {
        throw "POST /api/adoption-applications did not return ok=true."
    }

    Write-Host "  [OK] POST /api/adoption-applications -> id $($adoptionResult.id)"

    $helpResult = Invoke-RestMethod `
        -Uri "$baseUrl/api/help-requests" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Smoke Helper"
            email = "helper@example.ru"
            phone = "+7 (900) 000-00-02"
            helpType = "donation"
            amount = "2500"
            message = "Smoke test help payload"
            agreement = "yes"
            sourcePage = "/tests/smoke"
        } | ConvertTo-Json)

    if (-not $helpResult.ok) {
        throw "POST /api/help-requests did not return ok=true."
    }

    Write-Host "  [OK] POST /api/help-requests -> id $($helpResult.id)"
    Write-Host ""
    Write-Host "Smoke tests passed on $baseUrl"
    Write-Host "Checked $($paths.Count) GET routes and 2 POST requests."
    Write-Host "Test data was written to:"
    Write-Host "  $adoptionStorage"
    Write-Host "  $helpStorage"

    if ($KeepServerRunning) {
        Write-Host ""
        Write-Host "The temporary smoke-test server is still running on $baseUrl"
        Write-Host "Process ID: $($serverProcess.Id)"
    } else {
        Write-Host ""
        Write-Host "Note: the server on $baseUrl was started only for the smoke test."
        Write-Host "After the test it will be stopped automatically, so opening that port in a browser afterwards is expected to fail."
        Write-Host "If you want to keep it running, use:"
        Write-Host "  powershell -ExecutionPolicy Bypass -File .\tests\smoke-tests.ps1 -KeepServerRunning"
        Write-Host "If you want to open the site normally, run:"
        Write-Host "  powershell -ExecutionPolicy Bypass -File .\server\server.ps1 -Port $Port"
    }
} finally {
    if (-not $KeepServerRunning -and $serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
