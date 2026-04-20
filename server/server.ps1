param(
    [int]$Port = 8080,
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"

$scriptDirectory = if ($PSScriptRoot) {
    $PSScriptRoot
} elseif ($PSCommandPath) {
    Split-Path -Parent $PSCommandPath
} elseif ($MyInvocation.MyCommand.Path) {
    Split-Path -Parent $MyInvocation.MyCommand.Path
} else {
    (Get-Location).Path
}

$projectRoot = if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    [System.IO.Path]::GetFullPath((Join-Path $scriptDirectory ".."))
} else {
    [System.IO.Path]::GetFullPath($ProjectRoot)
}

function Read-JsonFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return $null
    }

    $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8

    if ([string]::IsNullOrWhiteSpace($raw)) {
        return $null
    }

    return $raw | ConvertFrom-Json
}

function Read-JsonArray {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )

    $data = Read-JsonFile -Path $Path

    if ($null -eq $data) {
        return @()
    }

    return @($data)
}

function Save-JsonFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Payload
    )

    $json = $Payload | ConvertTo-Json -Depth 12
    Set-Content -LiteralPath $Path -Value $json -Encoding UTF8
}

function Add-StorageRecord {
    param(
        [Parameter(Mandatory = $true)][string]$StoragePath,
        [Parameter(Mandatory = $true)]$Payload
    )

    $items = [System.Collections.Generic.List[object]]::new()

    foreach ($item in (Read-JsonArray -Path $StoragePath)) {
        [void]$items.Add($item)
    }

    $entry = [ordered]@{
        id = [guid]::NewGuid().ToString()
        createdAt = [DateTime]::UtcNow.ToString("o")
    }

    foreach ($property in $Payload.PSObject.Properties) {
        $entry[$property.Name] = $property.Value
    }

    [void]$items.Add([pscustomobject]$entry)
    Save-JsonFile -Path $StoragePath -Payload $items

    return [pscustomobject]$entry
}

function Get-ContentType {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css" { return "text/css; charset=utf-8" }
        ".js" { return "text/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".png" { return "image/png" }
        ".svg" { return "image/svg+xml" }
        default { return "application/octet-stream" }
    }
}

function Resolve-StaticPath {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$RelativePath
    )

    $normalized = $RelativePath.Trim("/")

    if ([string]::IsNullOrWhiteSpace($normalized)) {
        $normalized = "index.html"
    } elseif ([string]::IsNullOrWhiteSpace([System.IO.Path]::GetExtension($normalized))) {
        $normalized = [System.IO.Path]::Combine($normalized, "index.html")
    }

    $normalized = $normalized.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $normalized))

    if (-not $fullPath.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }

    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        return $null
    }

    return $fullPath
}

function Get-StatusText {
    param(
        [Parameter(Mandatory = $true)][int]$StatusCode
    )

    switch ($StatusCode) {
        200 { return "OK" }
        201 { return "Created" }
        400 { return "Bad Request" }
        404 { return "Not Found" }
        500 { return "Internal Server Error" }
        default { return "OK" }
    }
}

function Write-Response {
    param(
        [Parameter(Mandatory = $true)]$Stream,
        [Parameter(Mandatory = $true)][int]$StatusCode,
        [Parameter(Mandatory = $true)][string]$ContentType,
        [Parameter(Mandatory = $true)][byte[]]$BodyBytes
    )

    $statusText = Get-StatusText -StatusCode $StatusCode
    $headers = "HTTP/1.1 $StatusCode $statusText`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)

    $Stream.Write($headerBytes, 0, $headerBytes.Length)

    if ($BodyBytes.Length -gt 0) {
        $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
    }

    $Stream.Flush()
}

function Write-JsonResponse {
    param(
        [Parameter(Mandatory = $true)]$Stream,
        [Parameter(Mandatory = $true)][int]$StatusCode,
        [Parameter(Mandatory = $true)]$Payload
    )

    $json = $Payload | ConvertTo-Json -Depth 12
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    Write-Response -Stream $Stream -StatusCode $StatusCode -ContentType "application/json; charset=utf-8" -BodyBytes $bytes
}

function Find-HeaderEnd {
    param(
        [Parameter(Mandatory = $true)][byte[]]$Bytes
    )

    for ($index = 0; $index -le $Bytes.Length - 4; $index++) {
        if (
            $Bytes[$index] -eq 13 -and
            $Bytes[$index + 1] -eq 10 -and
            $Bytes[$index + 2] -eq 13 -and
            $Bytes[$index + 3] -eq 10
        ) {
            return $index
        }
    }

    return -1
}

function Read-HttpRequest {
    param(
        [Parameter(Mandatory = $true)]$Stream
    )

    $buffer = New-Object byte[] 8192
    $memory = [System.IO.MemoryStream]::new()
    $headerEnd = -1

    while ($headerEnd -lt 0) {
        $read = $Stream.Read($buffer, 0, $buffer.Length)

        if ($read -le 0) {
            $memory.Dispose()
            return $null
        }

        $memory.Write($buffer, 0, $read)
        $headerEnd = Find-HeaderEnd -Bytes $memory.ToArray()
    }

    $initialBytes = $memory.ToArray()
    $headerBytes = New-Object byte[] $headerEnd

    if ($headerEnd -gt 0) {
        [System.Array]::Copy($initialBytes, 0, $headerBytes, 0, $headerEnd)
    }

    $headerText = [System.Text.Encoding]::ASCII.GetString($headerBytes)
    $headerLines = $headerText -split "`r`n"
    $requestLine = $headerLines[0]
    $requestParts = $requestLine.Split(" ")

    if ($requestParts.Length -lt 2) {
        $memory.Dispose()
        return $null
    }

    $headers = @{}

    foreach ($line in $headerLines[1..($headerLines.Length - 1)]) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $pair = $line -split ":\s*", 2

        if ($pair.Length -eq 2) {
            $headers[$pair[0].ToLowerInvariant()] = $pair[1]
        }
    }

    $contentLength = if ($headers.ContainsKey("content-length")) { [int]$headers["content-length"] } else { 0 }
    $bodyStart = $headerEnd + 4

    while (($memory.Length - $bodyStart) -lt $contentLength) {
        $read = $Stream.Read($buffer, 0, $buffer.Length)

        if ($read -le 0) {
            break
        }

        $memory.Write($buffer, 0, $read)
    }

    $allBytes = $memory.ToArray()
    $bodyBytes = New-Object byte[] $contentLength

    if ($contentLength -gt 0 -and $allBytes.Length -gt $bodyStart) {
        $copyLength = [Math]::Min($contentLength, $allBytes.Length - $bodyStart)
        [System.Array]::Copy($allBytes, $bodyStart, $bodyBytes, 0, $copyLength)
    }

    $memory.Dispose()

    $requestUri = [System.Uri]::new("http://localhost$($requestParts[1])")

    return [pscustomobject]@{
        Method = $requestParts[0].ToUpperInvariant()
        Path = [System.Uri]::UnescapeDataString($requestUri.AbsolutePath).Trim("/")
        Headers = $headers
        BodyBytes = $bodyBytes
    }
}

function Handle-Request {
    param(
        [Parameter(Mandatory = $true)]$Request,
        [Parameter(Mandatory = $true)]$Stream
    )

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/site") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonFile -Path (Join-Path $projectRoot "data/site.json"))
        return
    }

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/faq") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonFile -Path (Join-Path $projectRoot "data/faq.json"))
        return
    }

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/news") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonFile -Path (Join-Path $projectRoot "data/news.json"))
        return
    }

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/animals") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonFile -Path (Join-Path $projectRoot "data/animals.json"))
        return
    }

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/adoption-applications") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonArray -Path (Join-Path $projectRoot "storage/adoption-applications.json"))
        return
    }

    if ($Request.Method -eq "GET" -and $Request.Path -eq "api/help-requests") {
        Write-JsonResponse -Stream $Stream -StatusCode 200 -Payload (Read-JsonArray -Path (Join-Path $projectRoot "storage/help-requests.json"))
        return
    }

    if ($Request.Method -eq "POST" -and $Request.Path -eq "api/adoption-applications") {
        $body = [System.Text.Encoding]::UTF8.GetString($Request.BodyBytes)

        if ([string]::IsNullOrWhiteSpace($body)) {
            Write-JsonResponse -Stream $Stream -StatusCode 400 -Payload @{ ok = $false; message = "Empty request body." }
            return
        }

        $payload = $body | ConvertFrom-Json

        if ([string]::IsNullOrWhiteSpace($payload.name) -or [string]::IsNullOrWhiteSpace($payload.phone)) {
            Write-JsonResponse -Stream $Stream -StatusCode 400 -Payload @{ ok = $false; message = "Please provide name and phone." }
            return
        }

        $entry = Add-StorageRecord -StoragePath (Join-Path $projectRoot "storage/adoption-applications.json") -Payload $payload

        Write-JsonResponse -Stream $Stream -StatusCode 201 -Payload @{
            ok = $true
            id = $entry.id
            message = "Adoption application saved to JSON storage."
        }
        return
    }

    if ($Request.Method -eq "POST" -and $Request.Path -eq "api/help-requests") {
        $body = [System.Text.Encoding]::UTF8.GetString($Request.BodyBytes)

        if ([string]::IsNullOrWhiteSpace($body)) {
            Write-JsonResponse -Stream $Stream -StatusCode 400 -Payload @{ ok = $false; message = "Empty request body." }
            return
        }

        $payload = $body | ConvertFrom-Json

        if (
            [string]::IsNullOrWhiteSpace($payload.name) -or
            [string]::IsNullOrWhiteSpace($payload.email) -or
            [string]::IsNullOrWhiteSpace($payload.message)
        ) {
            Write-JsonResponse -Stream $Stream -StatusCode 400 -Payload @{ ok = $false; message = "Please provide name, email and message." }
            return
        }

        $entry = Add-StorageRecord -StoragePath (Join-Path $projectRoot "storage/help-requests.json") -Payload $payload

        Write-JsonResponse -Stream $Stream -StatusCode 201 -Payload @{
            ok = $true
            id = $entry.id
            message = "Help request saved to JSON storage."
        }
        return
    }

    $staticPath = Resolve-StaticPath -RelativePath $Request.Path

    if ($null -eq $staticPath) {
        Write-JsonResponse -Stream $Stream -StatusCode 404 -Payload @{ ok = $false; message = "Resource not found." }
        return
    }

    $fileBytes = [System.IO.File]::ReadAllBytes($staticPath)
    Write-Response -Stream $Stream -StatusCode 200 -ContentType (Get-ContentType -Path $staticPath) -BodyBytes $fileBytes
}

function Get-AvailablePortSuggestions {
    param(
        [Parameter(Mandatory = $true)][int]$StartPort,
        [int]$Count = 5
    )

    $suggestions = [System.Collections.Generic.List[int]]::new()
    $port = $StartPort

    while ($suggestions.Count -lt $Count -and $port -lt 65535) {
        $probe = $null

        try {
            $probe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
            $probe.Start()
            [void]$suggestions.Add($port)
        } catch {
        } finally {
            if ($probe) {
                $probe.Stop()
            }
        }

        $port++
    }

    return $suggestions
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

try {
    $listener.Start()
} catch [System.Net.Sockets.SocketException] {
    $alternatives = Get-AvailablePortSuggestions -StartPort ($Port + 1)
    $portsText = if ($alternatives.Count -gt 0) {
        ($alternatives -join ", ")
    } else {
        "no nearby free ports found"
    }

    throw "Port $Port is already busy. Try: powershell -ExecutionPolicy Bypass -File .\server\server.ps1 -Port <free_port>. Suggestions: $portsText"
}

Write-Host "Local server started: http://localhost:$Port"
Write-Host "Project root: $projectRoot"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $stream = $client.GetStream()
            $request = Read-HttpRequest -Stream $stream

            if ($null -eq $request) {
                Write-JsonResponse -Stream $stream -StatusCode 400 -Payload @{ ok = $false; message = "Bad request." }
            } else {
                Handle-Request -Request $request -Stream $stream
            }
        } catch {
            try {
                if ($stream) {
                    Write-JsonResponse -Stream $stream -StatusCode 500 -Payload @{
                        ok = $false
                        message = "Server error."
                        details = $_.Exception.Message
                    }
                }
            } catch {
            }
        } finally {
            if ($stream) {
                $stream.Dispose()
            }

            $client.Dispose()
        }
    }
} finally {
    $listener.Stop()
}
