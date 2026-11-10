$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$sceneRoot = Split-Path -Parent $PSScriptRoot
$story = Get-Content -LiteralPath (Join-Path $sceneRoot 'src/previews/story.json') -Raw -Encoding utf8 | ConvertFrom-Json
$audioDirectory = Join-Path $sceneRoot 'audio/scene-preview'
New-Item -ItemType Directory -Force -Path $audioDirectory | Out-Null
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Huihui Desktop')
$synth.Rate = 0
$voiceEvidence = @()
try {
    foreach ($topic in @('solar', 'volcano')) {
        $lines = $story.captions.$topic
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $wavePath = Join-Path $audioDirectory ($topic + '-' + $i + '.wav')
            $synth.SetOutputToWaveFile($wavePath)
            $synth.Speak($lines[$i].text)
            $synth.SetOutputToNull()
            $voiceEvidence += @{ topic = $topic; index = $i; at = $lines[$i].at; text = $lines[$i].text; file = $wavePath }
        }
    }
} finally { $synth.Dispose() }
$voiceEvidence | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $audioDirectory 'voice.json') -Encoding utf8
Write-Output 'Generated narration at native SAPI rate; validate segment lengths before mixing.'
