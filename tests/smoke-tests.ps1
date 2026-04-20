param(
    [int]$Port = 8090
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
    Wait-Server -Url $baseUrl

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

    foreach ($path in $paths) {
        $response = Invoke-WebRequest "$baseUrl$path" -UseBasicParsing

        if ($response.StatusCode -ne 200) {
            throw "Expected HTTP 200 for $path but received $($response.StatusCode)."
        }
    }

    $site = Invoke-RestMethod "$baseUrl/api/site"

    if ([string]::IsNullOrWhiteSpace($site.brand.name)) {
        throw "Unexpected payload from /api/site."
    }

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

    Write-Host "Smoke tests passed on $baseUrl"
} finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
