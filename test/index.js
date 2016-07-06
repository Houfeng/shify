var shify = require('../');

var io = shify(function () {
  /*
  echo ${name} 
  nokit ls
  */
}, { params: { name: 'houfeng' } });

// io.on('error', function (err) {
//   //console.error('error', err);
// });
// io.on('success', function () {
//   //console.log('success');
// });

io.on('exit', function (code) {
  console.info('exit', code);
});

io.stdout.pipe(process.stdout);

// io.stderr.on('data', function (data) {
//   console.error(data.toString());
// });