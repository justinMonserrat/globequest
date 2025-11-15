import React, { useState, useEffect } from 'react';
import {
  generateFlagQuestion,
  generateCapitalQuestion,
  generatePopulationQuestion,
  generateLanguageQuestion,
  generateNeighborQuestion,
} from './QuizQuestionGenerator';

const QuizModal = ({ country, countryData, isOpen, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateQuestions = React.useCallback(async () => {
    if (!countryData) return;

    setLoading(true);
    const qs = [];

    try {
      // Question 1: Flag
      const flagOptions = await generateFlagQuestion(countryData);
      const correctFlag = flagOptions.find(opt => opt.isCorrect)?.flag || countryData.flags?.svg || countryData.flags?.png;
      qs.push({
        type: 'flag',
        question: 'What is the flag of ' + countryData.name.common + '?',
        options: flagOptions,
        correct: correctFlag,
      });

      // Question 2: Capital
      const capitalOptions = generateCapitalQuestion(countryData);
      qs.push({
        type: 'capital',
        question: 'What is the capital of ' + countryData.name.common + '?',
        options: capitalOptions,
        correct: countryData.capital?.[0] || 'N/A',
      });

      // Question 3: Population
      const populationOptions = generatePopulationQuestion(countryData);
      const pop = countryData.population;
      let correctPop;
      if (pop >= 1000000000) {
        correctPop = (pop / 1000000000).toFixed(1) + ' billion';
      } else if (pop >= 1000000) {
        correctPop = (pop / 1000000).toFixed(1) + ' million';
      } else if (pop >= 1000) {
        correctPop = (pop / 1000).toFixed(1) + ' thousand';
      } else {
        correctPop = pop.toString();
      }
      qs.push({
        type: 'population',
        question: 'What is the approximate population of ' + countryData.name.common + '?',
        options: populationOptions,
        correct: correctPop,
      });

      // Question 4: Languages
      const languageOptions = generateLanguageQuestion(countryData);
      qs.push({
        type: 'languages',
        question: 'What is a primary language spoken in ' + countryData.name.common + '?',
        options: languageOptions,
        correct: Object.values(countryData.languages || {})[0] || 'N/A',
      });

      // Question 5: Neighbors
      const neighborOptions = await generateNeighborQuestion(countryData);
      const correctNeighbor = neighborOptions.find(opt => opt.isCorrect)?.name || neighborOptions[0]?.name || 'Unknown';
      qs.push({
        type: 'neighbors',
        question: countryData.borders && countryData.borders.length > 0
          ? 'Which country shares a border with ' + countryData.name.common + '?'
          : 'What type of country is ' + countryData.name.common + '?',
        options: neighborOptions.map(opt => opt.name),
        correct: correctNeighbor,
      });

      setQuestions(qs);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  }, [countryData]);

  useEffect(() => {
    if (isOpen && countryData) {
      generateQuestions();
      setCurrentQuestion(0);
      setScore(0);
      setQuizComplete(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setLoading(true);
    }
  }, [isOpen, countryData, generateQuestions]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    
    setSelectedAnswer(answer);
    const currentQ = questions[currentQuestion];
    let correct = false;
    
    if (currentQ.type === 'flag') {
      correct = currentQ.correct === answer;
    } else {
      correct = currentQ.correct === answer;
    }
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Quiz complete
      setQuizComplete(true);
    }
  };

  const handleFinish = () => {
    const passed = score >= Math.ceil(questions.length * 0.8); // 80% required
    onComplete(passed, score, questions.length);
  };

  if (!isOpen || !countryData) {
    return null;
  }

  if (loading || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Quiz: {countryData.name.common}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!quizComplete ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>

                {currentQ.type === 'flag' && (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option.flag;
                      const isCorrectAnswer = currentQ.correct === option.flag;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(option.flag)}
                          disabled={selectedAnswer !== null}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            isSelected
                              ? isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : selectedAnswer !== null && isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-indigo-500'
                          }`}
                        >
                          <img
                            src={option.flag}
                            alt={option.label}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/320x213?text=Flag';
                            }}
                          />
                          <p className="mt-2 text-sm">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.type !== 'flag' && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectAnswer = currentQ.correct === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                            isSelected
                              ? isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : selectedAnswer !== null && isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-indigo-500'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedAnswer !== null && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="font-semibold">
                      {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm mt-1">
                        Correct answer: {currentQ.type === 'flag' 
                          ? currentQ.options.find(opt => opt.flag === currentQ.correct)?.label 
                          : currentQ.correct}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">
                {score >= Math.ceil(questions.length * 0.8) ? '🎉' : '😔'}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {score >= Math.ceil(questions.length * 0.8) ? 'Quiz Passed!' : 'Quiz Failed'}
              </h3>
              <p className="text-gray-600 mb-4">
                You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {score >= Math.ceil(questions.length * 0.8)
                  ? 'You need 80% to pass. Great job!'
                  : 'You need 80% to pass. Try again!'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleFinish}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {score >= Math.ceil(questions.length * 0.8) ? 'Unlock Country' : 'Try Again'}
                </button>
                {score < Math.ceil(questions.length * 0.8) && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;

