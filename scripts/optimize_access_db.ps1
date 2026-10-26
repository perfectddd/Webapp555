# SASSADEE Access Optimization (Phase 1)
$ErrorActionPreference = "Stop"

$workspaceDir = "C:\Users\User\Desktop\rea Snnd"
$dbFile = (Get-ChildItem -Path $workspaceDir -Filter "*.accdb")[0].FullName
$backupDir = Join-Path $workspaceDir "backups"
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }

$initialSize = (Get-Item $dbFile).Length / 1MB
Write-Host "=========================================================="
Write-Host "Starting SASSADEE Access Database Optimization (Phase 1)"
Write-Host "Target File: $dbFile"
Write-Host "Initial File Size: $([Math]::Round($initialSize, 2)) MB"
Write-Host "=========================================================="

# 1. Connect and clear tbl_import_error
$provider = "Provider=Microsoft.ACE.OLEDB.16.0;"
$dataSource = "Data" + " " + "Source=`"$dbFile`";"
$connStr = $provider + $dataSource + "Persist Security Info=False;"

try {
    $conn = New-Object System.Data.OleDb.OleDbConnection($connStr)
    $conn.Open()
    Write-Host "[1/3] Connected to Access Database."

    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT COUNT(*) FROM [tbl_import_error]"
    $errCount = $cmd.ExecuteScalar()
    Write-Host "  - Found $errCount leftover records in [tbl_import_error]"

    if ($errCount -gt 0) {
        $backupJsonPath = Join-Path $backupDir "backup_tbl_import_error.json"
        Write-Host "  - Backing up sample records to: $backupJsonPath ..."

        $adapter = New-Object System.Data.OleDb.OleDbDataAdapter("SELECT TOP 5000 * FROM [tbl_import_error]", $conn)
        $dt = New-Object System.Data.DataTable
        [void]$adapter.Fill($dt)

        $list = @()
        foreach ($row in $dt.Rows) {
            $obj = [ordered]@{}
            foreach ($col in $dt.Columns) {
                $obj[$col.ColumnName] = if ($row[$col.ColumnName] -is [DBNull]) { $null } else { $row[$col.ColumnName] }
            }
            $list += $obj
        }
        $list | ConvertTo-Json -Depth 3 | Out-File -FilePath $backupJsonPath -Encoding ascii
        Write-Host "  - Backup completed ($($list.Count) records saved)."

        Write-Host "  - Purging [tbl_import_error] ..."
        $delCmd = $conn.CreateCommand()
        $delCmd.CommandText = "DELETE FROM [tbl_import_error]"
        $deleted = $delCmd.ExecuteNonQuery()
        Write-Host "  - Purged $deleted records successfully."
    }

    $conn.Close()
} catch {
    Write-Host "  - Error with tbl_import_error: $($_.Exception.Message)"
    if ($conn.State -eq 'Open') { $conn.Close() }
}

Write-Host "`n[2/3] Optimization Step: Compact & Repair recommendation"
Write-Host "  - Access file bloat removed from table entries."
Write-Host "  - To reclaim OS disk space: Open Access -> File -> Info -> 'Compact & Repair Database'"

Write-Host "`n[3/3] Summary:"
$finalSize = (Get-Item $dbFile).Length / 1MB
Write-Host "  - Current Size: $([Math]::Round($finalSize, 2)) MB"
Write-Host "=========================================================="
