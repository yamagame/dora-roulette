import React from 'react';
import './App.css';
import 'whatwg-fetch'
const { Store } = require('./Store');

var images = [];
function preload(images) {
  for (var i = 0; i < images.length; i++) {
      images[i] = new Image();
      images[i].src = images[i];
  }
}

const rouletteTable = [
  [`cell0-a.png`, `cell0-b.png`],
  [`cell0-a.png`, `cell0-b.png`],
  [`cell1-a.png`, `cell1-b.png`],
  [`cell0-a.png`, `cell0-b.png`],
  [`cell0-a.png`, `cell0-b.png`],
];

preload([
  "/hit.jpeg",
  "/big-hit.jpeg",
  "/start-on.png",
  "/start-off.png",
  "/cell0-a.png",
  "/cell0-b.png",
  "/cell1-a.png",
  "/cell1-b.png",
])

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function post(command) {
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      var error = new Error(response.statusText)
      error.response = response
      throw error
    }
  }
  fetch(`/${command}`, {
    method: 'POST',
  })
  .then(checkStatus)
  .catch(function(err) {
    console.log(`request failed command ${command}`, err);
  })
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouse: 'off',
      counter: 0,
    }
    this.mouse = 'off';
    this.delay = 10;
    this.delayCounter = 0;
    this.target = 0;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.stopInterval();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.rouletteState !== nextProps.rouletteState) {
      if (nextProps.rouletteState === 'running') {
        this.delay = 0;
        this.target = 0;
        this.delayCounter = 0;
        this.startInterval();
      }
      if (nextProps.rouletteState === 'wait') {
        if (this.props.rouletteState == 'running') {
          post('push-stop');
          this.target = (this.state.counter % rouletteTable.length) + getRandomInt(rouletteTable.length) + 5*2;
          this.delay = 2;
        }
      }
      if (nextProps.rouletteState === 'ready') {
        if (this.props.rouletteState == 'idle') {
          post('push-start');
          this.props.dispatch({ type: 'rouletteState' , state: 'ready', });
        }
      }
    }
    return true;
  }

  startInterval() {
    this.stopInterval();
    this.intervalTimer = setInterval(() => {
      if (this.delayCounter <= 0) {
        this.delayCounter = this.delay;
        post('play-sound/button01a.wav');
        this.setState({
          counter: (this.state.counter + 1) % rouletteTable.length,
        }, () => {
          if (this.target > 0) {
            this.target --;
            if (this.target < 5) {
              this.delay = 10;
            }
            if (this.target < 3) {
              this.delay = 15;
            }
            if (this.target == 0) {
              this.stopInterval();
              setTimeout(() => {
                if ((this.state.counter % rouletteTable.length) == 2) {
                  post('big-hit');
                  this.props.dispatch({ type: 'rouletteState' , state: 'big-hit', });
                } else {
                  post('hit');
                  this.props.dispatch({ type: 'rouletteState' , state: 'hit', });
                }
                setTimeout(() => {
                  this.props.dispatch({ type: 'rouletteState' , state: 'idle', });
                }, 15000);
              }, 3000);
            }
          }
        })
      } else {
        this.delayCounter --;
      }
    }, 100);
  }

  stopInterval() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  onClickHandler = (key) => {
    return () => {
      if (key === 'mouse down') {
        this.mouse = 'on';
        this.setState({ mouse: 'on' });
      } else
      if (key === 'mouse up') {
        this.mouse = 'off';
        this.setState({ mouse: 'off' });
      } else
      if (key === 'mouse enter') {
        if ( this.mouse === 'on') {
          this.setState({ mouse: 'on' });
        }
      } else
      if (key === 'mouse leave') {
        this.setState({ mouse: 'off' });
      } else
      if (key === 'click start') {
        if (this.props.rouletteState == 'idle') {
          post('push-start');
          this.props.dispatch({ type: 'rouletteState' , state: 'ready', });
        }
      } else
      if (key === 'click stop') {
        if (this.props.rouletteState == 'running') {
          post('push-stop');
          this.props.dispatch({ type: 'rouletteState' , state: 'wait', });
          this.target = (this.state.counter % rouletteTable.length) + getRandomInt(rouletteTable.length) + 5*2;
          this.delay = 2;
        }
      }
    }
  }

  render() {
    const { counter } = this.state;
    const { rouletteState } = this.props;
    return (
      <div className="App"
        onMouseUp={this.onClickHandler('mouse up')}
        onMouseLeave={this.onClickHandler('mouse up')}
      >
        <img className="banner" src="banner.png" />
        <div className="cells" >
          <div className="padd" ></div>
          { rouletteTable.map( (v, i) => {
              return counter == i ? <img className="cell" src={v[1]} /> : <img className="cell" src={v[0]} />
            })
          }
          <div className="padd" ></div>
        </div>
        {
          rouletteState == 'idle' ? <img
            className="button"
            draggable="false"
            src={ this.state.mouse == "on" ? "/start-on.png" : "/start-off.png" }
            onClick={this.onClickHandler('click start')}
            onTouchStart={this.onClickHandler('start')}
            onTouchEnd={this.onClickHandler('end')}
            onTouchCancel={this.onClickHandler('cancel')}
            onTouchMove={this.onClickHandler('move')}
            onMouseDown={this.onClickHandler('mouse down')}
            onMouseEnter={this.onClickHandler('mouse enter')}
            onMouseLeave={this.onClickHandler('mouse leave')}
            onMouseMove={this.onClickHandler('mouse move')}
            onMouseOut={this.onClickHandler('mouse out')}
            onMouseOver={this.onClickHandler('mouse over')}
            onMouseUp={this.onClickHandler('mouse up')}
          /> : (rouletteState == "running" || rouletteState == "wait") ? <img
            className="button"
            draggable="false"
            src={ this.state.mouse == "on" ? "/stop-on.png" : "/stop-off.png" }
            onClick={this.onClickHandler('click stop')}
            onTouchStart={this.onClickHandler('start')}
            onTouchEnd={this.onClickHandler('end')}
            onTouchCancel={this.onClickHandler('cancel')}
            onTouchMove={this.onClickHandler('move')}
            onMouseDown={this.onClickHandler('mouse down')}
            onMouseEnter={this.onClickHandler('mouse enter')}
            onMouseLeave={this.onClickHandler('mouse leave')}
            onMouseMove={this.onClickHandler('mouse move')}
            onMouseOut={this.onClickHandler('mouse out')}
            onMouseOver={this.onClickHandler('mouse over')}
            onMouseUp={this.onClickHandler('mouse up')}
          /> : null
        }
        {
          rouletteState == 'hit' ? <img className="fullimage" src="hit.jpeg" /> : null
        }
        {
          rouletteState == 'big-hit' ? <img className="fullimage" src="big-hit.jpeg" /> : null
        }
      </div>
    )
  }
}

export default function() {
  return (
    <Store.Consumer>
      {
        context => { 
          return (<App rouletteState={context.state.rouletteState} dispatch={context.dispatch} />)
        }
      }
    </Store.Consumer>
  )
}
