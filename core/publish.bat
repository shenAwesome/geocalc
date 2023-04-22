cd /d "%~dp0"
xcopy /s/e/y "..\java\geoCalc\war\geocalc\geocalc.nocache.js" ".\lib\geocalc.nocache.js"
call tsc
call npm version patch
git commit -a -m "update" 
call npm publish