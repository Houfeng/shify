var exec = require('../');

var io = exec(function () {
  /*
  echo 'my name is ${name}'
  exit 187
  */
}, { params: { name: 'houfeng' } });

io.on('error', function (err) {
  console.error('error', err);
});
io.on('success', function () {
  console.log('success');
});
io.on('close', function (code) {
  console.info('exit', code);
});

io.stdout.on('data', function (data) {
  console.log(data.toString());
});

io.stderr.on('data', function (data) {
  console.error(data.toString());
});