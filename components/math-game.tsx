"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Operator = "+" | "-" | "*" | "/"
type GameState = "idle" | "playing" | "ended"

interface Question {
  num1: number
  num2: number
  operator: Operator
  answer: number
}

export default function MathGame() {
  const [gameState, setGameState] = useState<GameState>("idle")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Generate a random question based on operator
  const generateQuestion = useCallback((operator: Operator): Question => {
    let num1: number, num2: number, answer: number

    switch (operator) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 + num2
        break
      case "-":
        // Ensure positive result
        num1 = Math.floor(Math.random() * 50) + 10
        num2 = Math.floor(Math.random() * num1) + 1
        answer = num1 - num2
        break
      case "*":
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        break
      case "/":
        // Ensure whole number result
        answer = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        num1 = answer * num2
        break
      default:
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 + num2
    }

    return { num1, num2, operator, answer }
  }, [])

  // Get random operator (bonus feature)
  const getRandomOperator = useCallback((): Operator => {
    const operators: Operator[] = ["+", "-", "*", "/"]
    return operators[Math.floor(Math.random() * operators.length)]
  }, [])

  // Start new question
  const startNewQuestion = useCallback(() => {
    const operator = getRandomOperator()
    const question = generateQuestion(operator)
    setCurrentQuestion(question)
    setUserAnswer("")
    setFeedback(null)
  }, [generateQuestion, getRandomOperator])

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(30)
    startNewQuestion()
  }, [startNewQuestion])

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !userAnswer.trim()) return

    const userNum = Number.parseInt(userAnswer)
    if (userNum === currentQuestion.answer) {
      setScore((prev) => prev + 1)
      setTimeLeft((prev) => prev + 1) // Add 1 second for correct answer
      setFeedback("Correct! +1 second")
      setTimeout(() => setFeedback(null), 1000)
    } else {
      setFeedback(`Wrong! Answer was ${currentQuestion.answer}`)
      setTimeout(() => setFeedback(null), 1500)
    }

    startNewQuestion()
  }, [currentQuestion, userAnswer, startNewQuestion])

  // Handle input change and auto-start
  const handleInputChange = (value: string) => {
    setUserAnswer(value)
    if (gameState === "idle" && value.trim()) {
      startGame()
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (gameState === "playing") {
        handleSubmit()
      } else if (gameState === "idle") {
        startGame()
      }
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("ended")
            if (score > highScore) {
              setHighScore(score)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [gameState, timeLeft, score, highScore])

  // Restart game
  const restartGame = () => {
    setGameState("idle")
    setCurrentQuestion(null)
    setUserAnswer("")
    setScore(0)
    setTimeLeft(30)
    setFeedback(null)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-card-foreground">Math Sprint</h1>
        <p className="text-muted-foreground">How fast can you solve math problems?</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Score: {score}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Best: {highScore}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time:</span>
          <Badge
            variant={timeLeft <= 10 ? "destructive" : "default"}
            className="text-lg px-3 py-1 bg-accent text-accent-foreground"
          >
            {timeLeft}s
          </Badge>
        </div>
      </div>

      {/* Game Area */}
      <Card className="bg-card border-border">
        <CardHeader className="text-center pb-4">
          {gameState === "idle" && (
            <CardTitle className="text-card-foreground">Click Start or begin typing to play!</CardTitle>
          )}
          {gameState === "playing" && currentQuestion && (
            <CardTitle className="text-4xl font-bold text-card-foreground">
              {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
            </CardTitle>
          )}
          {gameState === "ended" && (
            <CardTitle className="text-card-foreground">Time's Up! Final Score: {score}</CardTitle>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Answer Input */}
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter your answer..."
              value={userAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={gameState === "ended"}
              className="text-center text-xl font-semibold bg-input border-border focus:ring-ring"
              autoFocus
            />

            {/* Feedback */}
            {feedback && (
              <div
                className={`text-center text-sm font-medium ${
                  feedback.includes("Correct") ? "text-green-600" : "text-destructive"
                }`}
              >
                {feedback}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {gameState === "idle" && (
              <Button onClick={startGame} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Start Game
              </Button>
            )}

            {gameState === "playing" && (
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit Answer
              </Button>
            )}

            {gameState === "ended" && (
              <Button onClick={restartGame} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Play Again
              </Button>
            )}
          </div>

          {/* Instructions */}
          {gameState === "idle" && (
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>• Solve math problems as fast as you can</p>
              <p>• Correct answers add +1 second</p>
              <p>• Includes +, -, ×, ÷ operations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
