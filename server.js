const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const { spawn } = require('child_process');

const PORT = process.env.PORT || 4222;
const ROBOT_SERVER = `http://localhost:3090/speech`;

const workFolder = 'DoraEngine';  //for macOS(development)
const HOME = (process.platform === 'darwin') ? path.join(process.env.HOME, 'Documents', workFolder) : process.env.HOME;

let sockets = [];

app.use(express.static(path.join(__dirname, 'build')));

//roulette -> robot
app.post('/push-start', function (req, res) {
  fetch(`${ROBOT_SERVER}`, { method: 'POST', body: 'roulette-start' })
    .then(res => res.text())
    .then(text => console.log(text));
  return res.sendStatus(200);
});

//roulette -> robot
app.post('/push-stop', function (req, res) {
  fetch(`${ROBOT_SERVER}`, { method: 'POST', body: 'roulette-stop' })
    .then(res => res.text())
    .then(text => console.log(text));
  return res.sendStatus(200);
});

//roulette -> robot
app.post('/hit', function (req, res) {
  fetch(`${ROBOT_SERVER}`, { method: 'POST', body: 'roulette-hit' })
    .then(res => res.text())
    .then(text => console.log(text));
  return res.sendStatus(200);
});

//roulette -> robot
app.post('/big-hit', function (req, res) {
  fetch(`${ROBOT_SERVER}`, { method: 'POST', body: 'roulette-big-hit' })
    .then(res => res.text())
    .then(text => console.log(text));
  return res.sendStatus(200);
});

//roulette -> aplay
app.post('/play-sound/:sound', function (req, res) {
//   console.log(req.params.sound);
  const base = path.join(HOME, 'Sound');
  const p = path.normalize(path.join(base, req.params.sound));
  const cmd = (process.platform === 'darwin') ? 'afplay' : 'aplay';
  const opt = (process.platform === 'darwin') ? [p] : ['-Dplug:softvol', p];
//   console.log(`/usr/bin/${cmd} ${p}`);
  const playone = spawn(`/usr/bin/${cmd}`, opt);
  playone.on('close', function() {
//     console.log('close');
  });
  return res.sendStatus(200);
});

//robot -> roulette
app.post('/start-roulette', function (req, res) {
  sockets.forEach( io => {
    io.emit('start-roulette', () => {
      console.log('start-roulette emit ok');
    });
  });
  console.log('start-roulette');
  return res.sendStatus(200);
});

//robot -> roulette
app.post('/stop-roulette', function (req, res) {
  sockets.forEach( io => {
    io.emit('stop-roulette', () => {
      console.log('stop-roulette emit ok');
    });
  })
  console.log('stop-roulette');
  return res.sendStatus(200);
});

//robot -> roulette
app.post('/ready-roulette', function (req, res) {
  sockets.forEach( io => {
    io.emit('ready-roulette', () => {
      console.log('ready-roulette emit ok');
    });
  });
  console.log('ready-roulette');
  return res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log(`connect ${socket.id}`);
  sockets.push(socket);
  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`);
    sockets = sockets.filter( sock => sock.id != socket.id );
  })
});

server.listen(PORT, () => {
  console.log(`roulette server listening on port ${PORT}!`)
});
