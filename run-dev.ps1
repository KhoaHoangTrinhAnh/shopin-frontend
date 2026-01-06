<#
Run both backend and frontend dev servers in sequence on Windows PowerShell.

Usage (PowerShell):
  PS> .\run-dev.ps1

You can override directories or port:
  PS> .\run-dev.ps1 -BackendDir "D:\shopin-backend" -FrontendDir "D:\shopin-frontend" -BackendPort 3000

The script will:
  1) Start `npm run start:dev` in the backend folder (detached process)
  2) Wait until `localhost:<BackendPort>` responds
  3) Start `npm run dev` in the frontend folder (foreground; output shown in current console)

Note: If PowerShell blocks script execution, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once.
#>

param(
    [string]$BackendDir = "D:\shopin-backend",
    [string]$FrontendDir = "D:\shopin-frontend",
    [int]$BackendPort = 3000,
    [int]$CheckIntervalSeconds = 1
)

function Test-PortOpen {
    param(
        [string]$TargetHost = 'localhost',
        [int]$Port = 3000
    )
    try {
        return Test-NetConnection -ComputerName $TargetHost -Port $Port -InformationLevel Quiet
    } catch {
        return $false
    }
}

Write-Host "[run-dev] Backend: $BackendDir"
Write-Host "[run-dev] Frontend: $FrontendDir"
Write-Host "[run-dev] Waiting for backend to listen on port $BackendPort..."

# Start backend as a new process (non-blocking)
Push-Location $BackendDir
$npmPath = (Get-Command npm -ErrorAction SilentlyContinue).Source
if (-not $npmPath) {
    Write-Error "npm not found in PATH. Please install Node/npm and ensure npm is available."
    Pop-Location
    exit 1
}

$backendProc = Start-Process -FilePath $npmPath -ArgumentList 'run','start:dev' -WorkingDirectory $BackendDir -NoNewWindow -PassThru
Pop-Location

# Wait until backend port is open
$maxWaitSeconds = 120
$elapsed = 0
while (-not (Test-PortOpen -TargetHost 'localhost' -Port $BackendPort)) {
    if ($elapsed -ge $maxWaitSeconds) {
        Write-Error "[run-dev] Timeout waiting for backend to listen on port $BackendPort after $maxWaitSeconds seconds."
        Write-Host "Backend process Id: $($backendProc.Id)"
        exit 2
    }
    Write-Host "[run-dev] Waiting... ($elapsed s)" -NoNewline
    Start-Sleep -Seconds $CheckIntervalSeconds
    $elapsed += $CheckIntervalSeconds
    Write-Host "`r" -NoNewline
}

Write-Host "[run-dev] Backend is listening on port $BackendPort (pid: $($backendProc.Id)). Starting frontend on port 3001..."

# Start frontend in foreground so user can see logs. Force dev port to 3001 to avoid collision.
Push-Location $FrontendDir
& npm run dev -- -p 3001
Pop-Location

# When frontend exits, script will end. Backend process will remain running.

Write-Host "[run-dev] Frontend stopped; leaving backend running (pid: $($backendProc.Id))."
