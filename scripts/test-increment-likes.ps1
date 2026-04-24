$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyem9kdm9zbGVhdWRkbmZ4cWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1NTE3MywiZXhwIjoyMDkwNTMxMTczfQ.YhtF8y1wKMcd1-ZfZLkxmLLTF16lQZRCdXXNwf7mqI0"
$body = '{"track_id":"6d7c8138-ec27-4275-8224-89302abf8780"}'
$headers = @{
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

try {
    $result = Invoke-RestMethod -Uri "https://urzodvosleauddnfxqio.supabase.co/rest/v1/rpc/increment_likes" -Method POST -Headers $headers -Body $body
    Write-Host "RPC call result: $result"
} catch {
    Write-Host "Error: $_"
    Write-Host "Response: $($_.Exception.Response)"
}
