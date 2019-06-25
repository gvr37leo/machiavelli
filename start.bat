start tsc
start tsc server.ts --target es6 --module amd --outFile server.js --inlineSourceMap --watch
start node --inspect .\server.js

timeout 2
start http://localhost:8000/


