 

// Ms Sql Server

$env:ASPNETCORE_ENVIRONMENT='Staging'
Add-Migration customerCreated2 -context MsDbContext -OutputDir Migrations/Ms
$env:ASPNETCORE_ENVIRONMENT='Staging'
Update-Database -context MsDbContext
