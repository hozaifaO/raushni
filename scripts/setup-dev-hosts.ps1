#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Add or refresh Raushni local named hosts (raushni-dev.com) on Windows.

.DESCRIPTION
  Equivalent of scripts/setup-dev-hosts.sh for Administrator PowerShell.
  Day-to-day Docker on localhost does NOT need this — only nginx TLS /
  smoke flows that expect *.raushni-dev.com.
#>

$ErrorActionPreference = "Stop"
$hostsFile = if ($env:HOSTS_FILE) { $env:HOSTS_FILE } else {
  Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
}

$markerStart = "# >>> raushni dev hosts >>>"
$markerEnd = "# <<< raushni dev hosts <<<"
$hostBlock = @"
$markerStart
127.0.0.1 raushni-dev.com
127.0.0.1 www.raushni-dev.com
127.0.0.1 api.raushni-dev.com
127.0.0.1 cms.raushni-dev.com
$markerEnd
"@

if (-not (Test-Path -LiteralPath $hostsFile)) {
  throw "Hosts file not found: $hostsFile"
}

$content = Get-Content -LiteralPath $hostsFile -Raw
if ($null -eq $content) { $content = "" }

$pattern = "(?ms)" + [regex]::Escape($markerStart) + ".*?" + [regex]::Escape($markerEnd)
if ([regex]::IsMatch($content, $pattern)) {
  $updated = [regex]::Replace($content, $pattern, $hostBlock.TrimEnd())
} else {
  $trimmed = $content.TrimEnd()
  $updated = if ($trimmed.Length -eq 0) { $hostBlock } else { $trimmed + "`r`n`r`n" + $hostBlock }
}

Set-Content -LiteralPath $hostsFile -Value $updated.TrimEnd() -Encoding ascii
Write-Host "Raushni dev hosts are configured in $hostsFile"
