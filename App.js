import './ade.js/quiz.css';
import './App.css';
import QuizPage from './ade.js/QuizPage';
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom"

function Home() {
  return(
    <div className='quizzica'>
      <h1>Quizzica</h1>
      <p>Some description if needed</p>
      <Link to="/quizPage">
        <button className='quizzica--btn' style={{ padding: '10px', cursor: 'pointer' }}>
          Start Quiz
        </button>
      </Link>
  </div>
  )
}

function App() {
  return (
    <div>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quizPage" element={<QuizPage />}/>
      </Routes>
    </Router>
  </div>

)
}

export default App;



//import Revision from './ade.js/Revision';
//import Profile from './ade.js/id'
// function App() {
  //     return (
//     <div>
//       <Profile />
//     </div>

//     )
//   }
  


















































// export default App;
