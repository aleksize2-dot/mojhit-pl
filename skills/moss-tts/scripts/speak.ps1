# MOSS-TTS-Nano Speak Script
# Uses MOSS-TTS-Nano to generate speech audio from text.
# Requires: Python 3.12 with moss-tts-nano installed.
#
# Usage: speak.ps1 -Text "Hello world" [-Voice <male|female|default>] [-Output <path>]

param(
    [Parameter(Mandatory=$true)]
    [string]$Text,
    
    [ValidateSet("default","male","female")]
    [string]$Voice = "default",
    
    [string]$Output = ""
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

$MOSS_CLI = "C:\Users\Admin\AppData\Local\Programs\Python\Python312\Scripts\moss-tts-nano.exe"

$voiceRefs = @{
    "default" = "C:\Users\Admin\.openclaw\workspace\MOSS-TTS-Nano\assets\audio\en_2.wav"
    "male"    = "C:\Users\Admin\.openclaw\workspace\MOSS-TTS-Nano\assets\audio\en_3.wav"
    "female"  = "C:\Users\Admin\.openclaw\workspace\MOSS-TTS-Nano\assets\audio\en_7.wav"
}

$promptSpeech = $voiceRefs[$Voice]

if (-not $Output) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $Output = Join-Path $env:TEMP "moss_tts_${ts}.wav"
}

Write-Host "[MOSS-TTS] Text: $($Text.Substring(0, [Math]::Min(60, $Text.Length)))..." -ForegroundColor Cyan

$result = & $MOSS_CLI generate `
    --text $Text `
    --prompt-speech $promptSpeech `
    --output $Output 2>&1

$resultStr = "$result"

if ($resultStr -match "saved generated audio to") {
    Write-Host "[MOSS-TTS] OK: $Output" -ForegroundColor Green
    Write-Output $Output
    exit 0
} else {
    Write-Host "[MOSS-TTS] FAILED" -ForegroundColor Red
    Write-Host $resultStr
    exit 1
}
