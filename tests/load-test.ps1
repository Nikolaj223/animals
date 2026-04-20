param(
    [int]$Port = 8091,
    [int]$Users = 6,
    [int]$RequestsPerUser = 18,
    [switch]$KeepServerRunning
)

$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$serverScript = Join-Path $projectRoot "server/server.ps1"
$baseUrl = "http://localhost:$Port"

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
    Write-Host "Load test: starting temporary server on $baseUrl"
    Wait-Server -Url $baseUrl
    Write-Host "Server is ready."
    Write-Host "Workers: $Users"
    Write-Host "Requests per worker: $RequestsPerUser"
    Write-Host "Paths under test: /, /catalog/, /news/, /api/animals, /api/news, /help/"
    Write-Host ""

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $jobs = @()

    for ($index = 1; $index -le $Users; $index++) {
        $jobs += Start-Job -ScriptBlock {
            param($Url, $Count)

            $paths = @("/", "/catalog/", "/news/", "/api/animals", "/api/news", "/help/")
            $latencies = @()

            for ($request = 0; $request -lt $Count; $request++) {
                $path = $paths[$request % $paths.Count]
                $requestStart = Get-Date
                $response = Invoke-WebRequest "$Url$path" -UseBasicParsing

                if ($response.StatusCode -ne 200) {
                    throw "Unexpected HTTP status $($response.StatusCode) for $path"
                }

                $latencies += ((Get-Date) - $requestStart).TotalMilliseconds
            }

            return [pscustomobject]@{
                Count = $latencies.Count
                AverageMs = [math]::Round((($latencies | Measure-Object -Average).Average), 2)
                MaxMs = [math]::Round((($latencies | Measure-Object -Maximum).Maximum), 2)
            }
        } -ArgumentList $baseUrl, $RequestsPerUser
    }

    Wait-Job -Job $jobs | Out-Null
    $results = Receive-Job -Job $jobs
    $stopwatch.Stop()

    $totalRequests = ($results | Measure-Object -Property Count -Sum).Sum
    $averageLatency = [math]::Round((($results | Measure-Object -Property AverageMs -Average).Average), 2)
    $maxLatency = [math]::Round((($results | Measure-Object -Property MaxMs -Maximum).Maximum), 2)
    $requestsPerSecond = [math]::Round(($totalRequests / $stopwatch.Elapsed.TotalSeconds), 2)

    Write-Host ""
    Write-Host "Load test finished on $baseUrl"
    Write-Host "Users: $Users"
    Write-Host "Total requests: $totalRequests"
    Write-Host "Average latency per worker: $averageLatency ms"
    Write-Host "Max latency: $maxLatency ms"
    Write-Host "Approx. throughput: $requestsPerSecond req/s"

    if ($KeepServerRunning) {
        Write-Host ""
        Write-Host "The temporary load-test server is still running on $baseUrl"
        Write-Host "Process ID: $($serverProcess.Id)"
    } else {
        Write-Host ""
        Write-Host "Note: the server on $baseUrl was started only for the load test."
        Write-Host "After the test it will be stopped automatically, so opening that port in a browser afterwards is expected to fail."
        Write-Host "If you want to open the site manually, run:"
        Write-Host "  powershell -ExecutionPolicy Bypass -File .\server\server.ps1 -Port $Port"
    }
} finally {
    if ($jobs) {
        $jobs | ForEach-Object {
            Stop-Job $_ -ErrorAction SilentlyContinue | Out-Null
            Remove-Job $_ -Force -ErrorAction SilentlyContinue | Out-Null
        }
    }

    if (-not $KeepServerRunning -and $serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
