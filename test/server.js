var bodyParser = require('../node_modules/body-parser');

module.exports = function(app, log) {
  app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  });

  //CORS middleware
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,HEAD');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");

    next();
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get('/ok', function(req, res){
    res.send('ok');
  });

  app.get('/error', function(req, res){
    res.status(500).send('error');
  });

  app.all('/headerecho', function(req, res){
    res.json(req.headers);
  });

  app.get('/json', function(req, res){
    res.json({foo: 'bar'});
  });

  app.get('/jsontext', function(req, res){
    res.send('{"foo": "bar"}');
  });

  app.all('/json', function(req, res){
    res.json(req.body);
  });

  app.get('/header', function(req, res) {
    res.send('accept-language: ' + req.headers['accept-language']);
  });

  app.all('/data', function(req, res){
    var buf = '';
    req.on('data', function(chunk){ buf += chunk; });
    req.on('end', function(){
      res.send(req.method + ': ' + buf);
    });
  });
}
