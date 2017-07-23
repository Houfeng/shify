var shify = require('../');

var io = shify(`
set -e
echo houfeng1 
echo houfeng2
`, { flags2: ['/d', '/s', '/c', 'bash'] });

// io.on('error', function (err) {
//   console.error('error', err);
// });
// io.on('success', function () {
//   console.log('success');
// });

//io.stdout.pipe(process.stdout);
//io.stderr.pipe(process.stderr);

io.stdout.on('data', function (data) {
  console.log(data.toString());
});

// io.stderr.on('data', function (data) {
//   console.error('error:', data.toString());
// });

io.on('exit', function (code) {
  console.log('exit:', code);
});
