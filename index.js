var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.set('home', __dirname + '/public');


app.get('/', function(request, response) {
  response.sendFile(app.get('home') + '/main.html');
  console.log("from me", __dirname);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});