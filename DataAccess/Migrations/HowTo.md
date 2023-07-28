 

// Ms Sql Server

$env:ASPNETCORE_ENVIRONMENT='Staging'
Add-Migration InitialCreate -context MsDbContext -OutputDir Migrations/Ms
$env:ASPNETCORE_ENVIRONMENT='Staging'
Update-Database -context MsDbContext
