xcopy /s/e/y ".\java\geoCalc\war\geocalc\geocalc.nocache.js" ".\lib\geocalc.nocache.js"

call tsc
git commit -a -m "gogo"
npm version patch
npm publish