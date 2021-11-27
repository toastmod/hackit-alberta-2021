var connect = require('connect');
var serveStatic = require('serve-static');

connect()
.use(serveStatic("./web"))
.listen(8080, () => console.log('Server running on 8080...'));