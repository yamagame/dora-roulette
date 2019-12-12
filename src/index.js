import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import io from 'socket.io-client';
import * as serviceWorker from './serviceWorker';
const { Store } = require('./Store');

const socket = io({
//   transports: ['websocket']
});

const initialState = { rouletteState: 'idle', };

function Provider({children}) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  socket.removeAllListeners('start-roulette');
  socket.removeAllListeners('stop-roulette');
  socket.removeAllListeners('ready-roulette');
  socket.on('start-roulette', (callback) => {
    dispatch({ type: 'rouletteState', state: 'running', });
    if (callback) callback('OK');
  });
  socket.on('stop-roulette', (callback) => {
    dispatch({ type: 'rouletteState', state: 'wait', });
    if (callback) callback('OK');
  });
  socket.on('ready-roulette', (callback) => {
    dispatch({ type: 'rouletteState', state: 'ready', });
    if (callback) callback('OK');
  });
  return <Store.Provider value={{ state, dispatch }}>{children}</Store.Provider>
}

function reducer(state, action) {
  switch(action.type) {
    case 'rouletteState':
      return { rouletteState: action.state, };
    default:
      throw new Error();
  }
}

ReactDOM.render(<Provider><App /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
