if (Test-Path './dist')
{
    Remove-Item './dist' -Recurse -Force
}

tsc --sourceMap false

npm publish