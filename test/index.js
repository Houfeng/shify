var shify = require('../');

var io = shify(`
echo houfeng
dn build
echo -e '\\033[31m 红色字 \\033[0m'
`);

io.on('error', function (err) {
  console.error('error', err);
});
io.on('success', function () {
  console.log('success');
});

io.stdout.pipe(process.stdout);
//io.stderr.pipe(process.stderr);

// io.stdout.on('data', function (data) {
//   console.log(data.toString());
// });

// io.stderr.on('data', function (data) {
//   console.error(data.toString());
// });

io.on('exit', function (code) {
  console.log('exit:', code);
});
