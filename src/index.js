/* eslint-disable no-undef */
// import { getSuggestedQuery } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 受控组件，每一个块块 ，不单独拥有state
// class Square extends React.Component {
//   render() {
//     return (
//       <button className="square" onClick={() => this.props.onClick()}>
//         {this.props.value}
//       </button>
//     );
//   }
// }

//和上边组件完成同样的功能，但是写起来更简便
function Square(props) {
  // console.log('props.winner', props.winner)
  // console.log('props.winnerLines', props.winnerLines)
  // console.log('props.index', props.index)
  return (
    <button className="square" onClick={props.onClick}>
      <span className={props.winner && props.winnerLines.indexOf(props.index) > -1 ? "redColor" : ""}> {props.value}</span>
    </button>
  )
}

// 控制 Square 组件
class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winnerLines={this.props.winnerLines}
        winner={this.props.winner}
        key={i}
        index={i}
      />
    );
  }

  render() {
    // 使用两个循环来渲染棋盘的格子，而不是用 hardcode 在代码中写死
    let outDrive = [];
    for (let i = 0; i < 9; i += 3) {
      let squares = [];
      for (let j = i; j < i + 3; j++) {
        let square = this.renderSquare(j);
        squares.push(square);
      }
      outDrive.push(<div className='board-row' key={i}>{squares}</div>)
    }
    return (
      <div>
        {outDrive}
      </div>
    );
  }
}


class Game extends React.Component {

  constructor(props) {
    super(props);
    let labels = [];
    for (let i = 1; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        labels.push(`(${i},${j})`)
      }
    }
    // history 用来记录操作历史记录
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        thisStep: null
      }],
      xIsNext: true,   //确定下一步应该轮到哪个玩家
      stepNumber: 0,   //代表当前我们正在查看哪一项历史记录
      labels: labels,
      thisStep: null,
      desc: false,
      winner: null,
      winnerLines: null
    };
    console.log('labels,', labels)
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        console.log('获胜', lines[i])
        return { winner: squares[a], winnerLines: lines[i] };
      }
    }
    return null;
  }

  handleClick(i) {
    // “回到过去”后，把“未来”不正确的历史记录丢弃掉
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // 使用 .slice() 方法创建数组的一个副本，【不可变性】方便简化功能、跟踪数据改变、确定重新渲染的时间
    const squares = current.squares.slice();
    const { labels } = this.state;
    if (this.calculateWinner(squares) || squares[i]) {
      console.log('找到赢家')
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    let winResult = this.calculateWinner(squares);

    this.setState({
      winner: winResult ? winResult.winner : null,
      winnerLines: winResult ? winResult.winnerLines : null
    })

    this.setState({
      // concat() 不会改变原数组，推荐
      history: history.concat([{
        squares: squares,
        thisStep: labels[i],
      }]),
      xIsNext: !this.state.xIsNext, //每移动一步，布尔值反转，实现交替落子的效果
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    const history = this.state.history.concat();
    const current = history[step];
    const winnerReaults = this.calculateWinner(current.squares);
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      winner: winnerReaults ? winnerReaults.winner : null,
      winnerLines: winnerReaults ? winnerReaults.winnerLines : null
    });
  }

  sort() {
    this.setState({
      desc: !this.state.desc,
    })
  }

  render() {
    const { history, stepNumber, desc } = this.state;
    const current = history[stepNumber];
    const winnerReaults = this.calculateWinner(current.squares);  //哪一行胜利了

    // console.log('history,', history)
    let moves = history.map((step, move) => {
      let className = stepNumber === move ? 'boldLi' : '';
      const { thisStep } = step;
      const desc = move ?
        `Go to move #${move}${thisStep}` :
        'Go to game start';
      return (
        <li key={'li' + move} className={className}>
          <button className={className} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    let status;
    let winnerLines = winnerReaults?.winnerLines;
    let winner = winnerReaults?.winner;

    if (winner) {
      status = '获胜者：' + winner;
    } else if (this.state.stepNumber != 9) {
      status = 'Next player:' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = '无人胜出';
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winnerLines={winnerLines} winner={winner} />
        </div>
        <div className="game-info">
          <div className="game-control">
            <div className={(winner || this.state.stepNumber == 9) ? "redColor" : ""}>{status}</div>
            <button onClick={() => this.sort()} className="descBtn">切换升降序</button>
          </div>

          {/* 包含按钮的列表 */}
          <ol>{desc ? moves.reverse() : moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
