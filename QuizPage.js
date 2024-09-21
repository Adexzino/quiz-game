import './quiz.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizPage() {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Track selected answers
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false); // Track when to show correct answers
  const [score, setScore] = useState(0); // Track the user's score

   // Function to save data to localStorage
   function saveToLocalStorage (data, answers, showResults, score) {
    localStorage.setItem('quizData', JSON.stringify(data));
    localStorage.setItem('selectedAnswers', JSON.stringify(answers));
    localStorage.setItem('showCorrectAnswers', JSON.stringify(showResults));
    localStorage.setItem('score', JSON.stringify(score));
  };

  // Function to load data from localStorage
  function loadFromLocalStorage () {
    const storedQuizData = JSON.parse(localStorage.getItem('quizData')),
          storedSelectedAnswers = JSON.parse(localStorage.getItem('selectedAnswers')),
          storedShowCorrectAnswers = JSON.parse(localStorage.getItem('showCorrectAnswers')),
          storedScore = JSON.parse(localStorage.getItem('score'));

    if (storedQuizData) setQuizData(storedQuizData);
    if (storedSelectedAnswers) setSelectedAnswers(storedSelectedAnswers);
    if (storedShowCorrectAnswers) setShowCorrectAnswers(storedShowCorrectAnswers);
    if (storedScore) setScore(storedScore);
    setLoading(false);
  };


  async function fetchQuizData (url, maxRetries = 5) {
    let retries = 0;
    const backoffFactor = 1;

    while (retries < maxRetries) {
      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          setQuizData(response.data.results);
          saveToLocalStorage(response.data.results, {}, false, 0);
          setLoading(false);
          return;
        }
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retries += 1;
          const sleepTime = backoffFactor * (2 ** (retries - 1));
          console.log(`Rate limit exceeded. Retrying in ${sleepTime} seconds...`);
          await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
        } else {
          setError(error.message);
          setLoading(false);
          return;
        }
      }
    }
    setError('Max retries exceeded');
    setLoading(false);
  };

  useEffect(() => {
    const storedQuizData = localStorage.getItem('QuizData');
    if (storedQuizData) {
      loadFromLocalStorage();
    } else {
        const url = "https://opentdb.com/api.php?amount=10&category=9&difficulty=hard&type=multiple";
        fetchQuizData(url);
        console.log(url)
    }
  }, []);

  function shuffleAnswers (correctAnswer, incorrectAnswers) {
    const answers = [...incorrectAnswers, correctAnswer];
    return !showCorrectAnswers ? answers : answers.sort(() => Math.random() - 0.5);
  };

  function handleAnswerClick(questionIndex, answer) {
    const updatedAnswers = {
      ...selectedAnswers,
      [questionIndex]: answer
    };
    setSelectedAnswers(updatedAnswers);
    saveToLocalStorage(quizData, updatedAnswers, showCorrectAnswers, score);
  };

  function handleShowResults () {
    let calculatedScore = 0;
    quizData.forEach((item, index) => {
      if (selectedAnswers[index] === item.correct_answer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setShowCorrectAnswers(true);
    saveToLocalStorage(quizData, selectedAnswers, true, calculatedScore);
  };
  
  function handleStartNewGame() {
     // Clear localStorage and reset state to start a new quiz
     localStorage.removeItem('quizData');
     localStorage.removeItem('selectedAnswers');
     localStorage.removeItem('showCorrectAnswers');
     localStorage.removeItem('score');
    // Reset state to start a new quiz
    setSelectedAnswers({});
    setShowCorrectAnswers(false);
    setScore(0);
    setLoading(true);
    setError(null);
    fetchQuizData("https://opentdb.com/api.php?amount=10&category=9&difficulty=hard&type=multiple");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='main--quiz'>
      <h1>Quiz Questions</h1>
      {quizData.map((item, index) => {
        const shuffledAnswers = shuffleAnswers(item.correct_answer, item.incorrect_answers);
        const userSelectedAnswer = selectedAnswers[index];

        return (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h3>{item.question}</h3>
            {shuffledAnswers.map((answer, idx) => (
              <button
                className='quiz--btn'
                key={idx}
                onClick={() => handleAnswerClick(index, answer)}
                style={{
                  backgroundColor:
                    showCorrectAnswers
                      ? answer === item.correct_answer
                        ? 'green'
                        : userSelectedAnswer === answer
                        ? 'red'
                        : ''
                      : userSelectedAnswer === answer
                      ? '#6E6D70'
                      : '',
                  color: showCorrectAnswers ? '#DFDEDF' : 'black',
                }}
                disabled={showCorrectAnswers} // Disable buttons once results are shown
              >
                {answer}
              </button>
            ))}
          </div>
        );
      })}

      {/* Button to show results and score */}
      {!showCorrectAnswers && (
        <button className='btn' onClick={handleShowResults}>
          Check Answers
        </button>
      )}

      {/* Conditional rendering: Show correct answers and score if all questions have been answered */}
      {showCorrectAnswers && (
        <div>
          <h3>You Scored {score} / {quizData.length} of correct answers</h3>
          <h3>Review Answers:</h3>
          {quizData.map((item, index) => (
            <p key={index}>
              <strong>Question:</strong> {item.question} <br />
              <strong>Your Answer:</strong> {selectedAnswers[index]} <br />
              <strong>Correct Answer:</strong> {item.correct_answer}
            </p>
          ))}
        </div>
      )}
      <button className='btn active--btn' onClick={handleStartNewGame}>Play Quiz Again</button>
    </div>
  );
};

export default QuizPage;
