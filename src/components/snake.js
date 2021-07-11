import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

import { useInterval } from "../hooks/useInterval";
import * as Config from "../constants";

const Snake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(Config.SNAKE_START);
  const [apple, setApple] = useState(Config.APPLE_START);
  const [direction, setDirection] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameover] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(Config.SCALE, 0, 0, Config.SCALE, 0, 0);
    context.clearRect(0, 0, Config.CANVAS_SIZE[0], Config.CANVAS_SIZE[1]);

    context.fillStyle = "black";
    snake.forEach(([x, y]) => {
      context.fillRect(x, y, 1, 1);
    });

    context.fillStyle = "lightblue";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  useInterval(() => gameLoop(), speed);

  const startGame = () => {
    setSnake(Config.SNAKE_START);
    setApple(Config.APPLE_START);
    setDirection([0, -1]);
    setSpeed(Config.SPEED);
    setGameover(false);
    setScore(0);
  };

  const endGame = () => {
    setSpeed(null);
    setGameover(true);
  };

  const moveSnake = ({ keyCode }) =>
    keyCode >= 37 && keyCode <= 40 && setDirection(Config.DIRECTIONS[keyCode]);

  const createApple = () =>
    apple.map((_e, i) =>
      Math.floor((Math.random() * Config.CANVAS_SIZE[i]) / Config.SCALE)
    );

  const checkCollision = (piece, snk = snake) => {
    if (
      piece[0] * Config.SCALE >= Config.CANVAS_SIZE[0] ||
      piece[0] < 0 ||
      piece[1] * Config.SCALE >= Config.CANVAS_SIZE[1] ||
      piece[1] < 0
    ) {
      return true;
    }
    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) {
        return true;
      }
    }
    return false;
  };

  const checkAppleCollision = (newSnake) => {
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = createApple();
      let newScore = score + 1;
      while (checkCollision(newApple, newSnake)) {
        newApple = createApple();
      }
      setApple(newApple);
      setScore(newScore);
      if (newScore % 3 === 0) {
        let newSpeed = speed - 50;
        newSpeed <= 100 ? setSpeed(100) : setSpeed(newSpeed);
      }
      if (newScore > localStorage.getItem("score")) {
        localStorage.setItem("score", newScore);
      }
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [
      snakeCopy[0][0] + direction[0],
      snakeCopy[0][1] + direction[1],
    ];
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) {
      return endGame();
    }
    if (!checkAppleCollision(snakeCopy)) {
      snakeCopy.pop();
    }
    setSnake(snakeCopy);
  };

  return (
    <StyleSnake role="button" tabIndex="0" onKeyDown={(e) => moveSnake(e)}>
      <div className="Head">
        <div className="Score">Score: {score}</div>
        <div className="Score">Best Score: {localStorage.getItem("score")}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={`${Config.CANVAS_SIZE[0]}px`}
        height={`${Config.CANVAS_SIZE[1]}px`}
        style={{ border: "1px solid black" }}
      />
      {gameOver ? <div className="GameOver">Game Over!</div> : null}
      <button className="StartButton" onClick={startGame}>
        {gameOver ? "Play Again" : "Start Game"}
      </button>
    </StyleSnake>
  );
};

export default Snake;

const StyleSnake = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  border: none;
  max-width: 600px;

  .Head {
    display: flex;
    justify-content: space-around;
  }

  .Score {
    font-size: 1.2em;
    margin: 8px auto;
  }

  .GameOver {
    position: absolute;
    top: 50%;
    left: 50%;
    background: #891818;
    color: white;
    font-size: 2.6em;
    padding: 20px;
    transform: translate(-50%, -50%);
    border: 1px solid;
    border-radius: 20px;
  }

  .StartButton {
    margin: 8px auto 0;
    padding: 8px;
    border-radius: 13px;
    border: none;
    color: white;
    background: #313131;
    font-size: 1.6rem;
    outline: none;
    cursor: pointer;
  }
`;
