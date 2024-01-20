const express = require('express');
  app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Filter = require('bad-words'),
	filter = new Filter();

let users = [];

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/views/index.html');
});

app.use(express.static('./public'));

io.on('connection', socket => {
	io.emit('get name', users);

	socket.on('chat message', msg => {
		io.emit('chat message', filter.clean(msg));
	});

	socket.on('user joined', theUser => {
		users.push(theUser);
		io.emit('user joined', filter.clean(theUser), users);
	});

	socket.on('user closed tab', user => {
		users.splice(users.indexOf(user), 1);
		io.emit('closed tab', filter.clean(user), users);
	});

});

http.listen(5050, () => {
	let time = new Date().toLocaleString() + ' UTC time';
	console.log('listening on localhost:5050 starting at ' + time);
});

process.on('exit', function() {
	console.log('Goodbye!');
});
