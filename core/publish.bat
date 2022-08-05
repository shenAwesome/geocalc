cd /d "%~dp0"
xcopy /s/e/y "..\java\geoCalc\war\geocalc\geocalc.nocache.js" ".\lib\geocalc.nocache.js"
call tsc
git commit -a -m "gogo"
call npm version patch
call npm publish