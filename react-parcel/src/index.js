import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var n;

class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { n: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({n: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    n = this.state.n;
    ReactDOM.render(<Game />,document.getElementById('root'));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <p>Enter a number n. Your game board will have the size n x n.</p>
        <input type='text'onChange={this.handleChange}/>
        <input type='submit'/>
      </form>
    );
  }
}

function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    let squares = [];
    for (let i = 0; i < n; ++i) {
      let row = [];
      for (let j = 0; j < n; ++j) {
        row.push(this.renderSquare(i * n + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }
    return (
      <div>{squares}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
          squares: Array(n*n).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
          squares: squares,
          latestMoveSquare: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;

    let moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const col = 1 + latestMoveSquare % 3;
      const row = 1 + Math.floor(latestMoveSquare / 3);
      const desc = move ?
        `Go to move #${move} (${col}, ${row})` :
        'Go to game start';
      return (
        <li key={move}>
          <button
            className={move === stepNumber ? 'move-list-item-selected' : ''}
            onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winInfo.isDraw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    const isAscending = this.state.isAscending;
    if (!isAscending) {
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleSortToggle()}>
            {isAscending ? 'descending' : 'ascending'}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<MyForm />, document.getElementById('root'));

function calculateWinner(squares) {
  const lines = []
  var vertical = []
  var horizontal = []
  var diagonal1 = []
  var diagonal2 = []

  for (let i=0; i<n; i++){
    for (let j=0; j<n; j++){
      vertical.push(j+i*n)
      horizontal.push(i+n*j)
    }
    lines.push(vertical);
    lines.push(horizontal);
    vertical = [];
    horizontal = [];
  }

  for (let i=0; i<n; i++){
    diagonal1.push(i*n+i)
    diagonal2.push((n-1)*(i+1))
  }
  lines.push(diagonal1)
  lines.push(diagonal2)


  for (let i = 0; i < lines.length; i++) {
    var x = true
    var a = []
    for (let i=0; i < n; i++){
      a.push(i)
    }
    a = lines[i];

    for (let i=0; i<n-1; i++){
      if (!squares[a[0]] || squares[a[0]] !== squares[a[i+1]]){
        x = false
        break;
      }
    }

    if (x===true){
      return {
        winner: squares[a[0]],
        line: lines[i],
        isDraw: false,
      }
    }
  }

  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }

  return {
    winner: null,
    line: null,
    isDraw: isDraw,
  }
}
