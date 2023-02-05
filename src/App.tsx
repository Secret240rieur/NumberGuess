import { useEffect, useState } from "react";
import gameOver from './photo/game_over_neon_lights_hd_game_over.jpg';
import { FaTimes } from "react-icons/fa";
import { useAuthUser, useAuthSignOut } from "@react-query-firebase/auth";
import { collection, DocumentData, getFirestore, query, doc, onSnapshot, orderBy } from "firebase/firestore";
import { useFirestoreDocument, useFirestoreDocumentMutation } from "@react-query-firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { SignUpGoogle } from "./signUpGoogle";
import classNames from "classnames";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX6JNXl5DFt8lDCRfcq0DV4V4rKsz5iZ0",
  authDomain: "numberguess-fc6a0.firebaseapp.com",
  projectId: "numberguess-fc6a0",
  storageBucket: "numberguess-fc6a0.appspot.com",
  messagingSenderId: "110855956907",
  appId: "1:110855956907:web:15c91d98addd6b6294caee"
};



// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
export const auth = getAuth(firebase);
const firestore = getFirestore(firebase);


function App() {
  const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'CLEAR', '0', 'OK'];
  const [result, setResult] = useState('Type your guess');
  const [numberGenerated, setNumberGenerated] = useState(Math.floor(Math.random() * 1000));
  const [finalResult, setFinalResult] = useState(0);
  const [trysLeft, setTrysLeft] = useState(30);
  const [fail, setFail] = useState(false);
  const [win, setWin] = useState(false);
  console.log(numberGenerated)
  const [score, setScore] = useState(0);
  const [sup, setSup] = useState(false);
  const [inf, setInf] = useState(false);
  const [closeBtnVisible, setCloseBtnVisible] = useState(true);
  const [transition, setTransition] = useState('translate-x-full');
  const [started, setStarted] = useState(false);

  const user = useAuthUser(["user"], auth);
  //upload
  const refUpload = collection(firestore, "leaderboard");
  let highscoreRef = doc(refUpload, user.data ? user.data?.uid : 'undefined');
  const highScoreUpload = useFirestoreDocumentMutation(highscoreRef);



  const refDownload = query(refUpload, orderBy("highScore", "desc"));
  const [leaderboard, setLeaderboard] = useState<DocumentData[] | undefined>([]);
  const [highScore, setHighScore] = useState(0);


  const username = "@" + user.data?.email!.slice(0, user.data?.email!.lastIndexOf("@"));

  useEffect(() => {
    const updateLeaderboard = onSnapshot(refDownload, { includeMetadataChanges: true },
      (QuerySnapshot) => {
        const tmp = QuerySnapshot.docs.map((v) => v.data());
        setLeaderboard(tmp);
        const hasHighscore = tmp?.find((v) => v.name === username);
        if (hasHighscore && user.data && hasHighscore?.highScore > score) {
          setHighScore(tmp?.find((v) => v.name === username)?.highScore)
        }
      }
    );
    return updateLeaderboard;
  }, [highScore, started, user.data])


  const ref = doc(firestore, "leaderboard", user.data ? user.data?.uid : 'undefined');

  const product = useFirestoreDocument(["leaderboard", user.data ? user.data?.uid : 'undefined'], ref);
  useEffect(() => {
    if (product.data?.data()?.highScore)
      setHighScore(product.data?.data()?.highScore)
  }, [])


  const delayResend = 180;
  const [delay, setDelay] = useState(delayResend);
  const minutes = Math.floor(delay / 60);
  const seconds = Math.floor(delay % 60);

  useEffect(() => {//works
    if (started === true) {
      const timer = setInterval(() => {
        setDelay(delay - 1);
      }, 1000);

      if (delay === 0) {
        clearInterval(timer);
      }

      if (minutes === 0 && seconds === 0) { setFail(true); setStarted(false) }


      return () => {
        clearInterval(timer);
      };
    }
  });

  useEffect(() => {//works
    if (win === true) {
      if (numberGenerated < 100) setScore(score + numberGenerated + delay + trysLeft)
      else if (numberGenerated >= 100) setScore(score + 10 * (numberGenerated + delay + trysLeft))
      setDelay(delayResend);
      setTrysLeft(30);
      setNumberGenerated(Math.floor(Math.random() * 1000));

      setWin(false);

    }
  }, [win])

  useEffect(() => { //works
    if (score > highScore) {
      setHighScore(score);
      if (user.data) {
        alert("mutate highscore")
        highScoreUpload.mutate({
          name: username,
          highScore: score,
          id: user.data?.uid
        })
      }
      setStarted(true);
    }
  }, [score])

  useEffect(() => {
    if (user.data) setTransition('translate-x-full')

  })

  const logOut = useAuthSignOut(auth);




  function onSelect(value: string) {

    if (value === 'OK' && result !== 'Type your guess') {
      setFinalResult(Number(result));
      setTrysLeft(trysLeft - 1);
      if (Number(result) === numberGenerated) {
        setWin(true);
        setSup(false);
        setInf(false);
      }
      if (Number(result) > numberGenerated) {
        setSup(true);
        setWin(false);
        setInf(false);
      }
      if (Number(result) < numberGenerated) {
        setInf(true);
        setSup(false);
        setWin(false);
      }
      if (trysLeft - 1 === 0) { setFail(true); setStarted(false) };
      setResult('Type your guess');
    }
    else if (value === 'CLEAR') setResult('Type your guess')
    else if (result !== 'Type your guess') {//concat
      setResult(result + '' + value)
    }
    else if (value !== 'OK' && value !== '0') {//replace text
      setResult(value);
    }
  }


  return (
    <div className="overflow-hidden bg-teal-100">
      {fail && <div className="">
        <img src={gameOver} alt="Game Over" className="w-screen h-screen absolute" />
        <nav className="absolute flex justify-between inset-x-0 bottom-0 p-[10px]">
          <input type="button" value="Restart" className="cursor-pointer bg-teal-500 text-white text-xl p-[10px] font-bold rounded-lg w-[100px]" onClick={() => window.location.reload()} />
          <input type="button" value="Quit" className="cursor-pointer bg-teal-500 text-white text-xl p-[10px] font-bold rounded-lg w-[100px]" onClick={() => window.close()} />
        </nav>
      </div>}
      {!fail && <div className="p-[30px] relative">

        <h1 className='text-3xl font-bold text-teal-700 flex justify-center mb-[50px]'>Number Guess</h1>
        {username != '@undefined' && <span className="absolute top-5 right-[200px] text-teal-700 text-xl font-bold">{username}</span>}
        {!user.data && <input type="button" value="Login" className="cursor-pointer bg-teal-500 text-xl font-bold text-white absolute top-3 right-3 px-[20px] py-2 flex items-center rounded-[30px] " onClick={() => {
          setTransition('translate-none');
          setCloseBtnVisible(true);
        }} />}

        {user.data && <input type="button" value="Logout" className="cursor-pointer bg-teal-500 text-xl font-bold text-white absolute top-3 right-3 px-[20px] py-2 flex items-center rounded-[30px] " onClick={() => logOut.mutate()} />}


        {<div className={`absolute right-0 top-0 bg-teal-500 w-[350px] ${transition} transition  duration-500 h-screen`}>
          {closeBtnVisible && <button title="closeBtn" className="absolute top-6 right-6 text-2xl text-white" onClick={() => {
            setTransition('translate-x-full');
            setCloseBtnVisible(false);
          }}><FaTimes /></button>}
          <h1 className="my-[100px] flex justify-center text-3xl font-bold text-white">Login</h1>
          <div className="w-3/4 flex mx-auto">
            <SignUpGoogle />
          </div>
        </div>}
        <div className="absolute inset-x-0 top-30 flex justify-center">

          {!started && <input type="button" value='Start' className="cursor-pointer flex items-center justify-center text-3xl font-medium text-white rounded-lg bg-green-600 w-[100px] h-[50px]"
            onClick={() => setStarted(true)} />}

        </div>
        <div className="mb-[20px] text-teal-700 font-bold">
          <div >Score: {score}</div>
          <div >Highscore: {highScore}</div>
        </div>

        <div className="flex justify-between">


          <div>

            <div className="flex items-center justify-center text-3xl font-medium text-white rounded-full bg-red-600 w-[100px] h-[100px]">
              <span >
                {minutes}:{seconds < 10 ? '0' + seconds : seconds}
              </span>
            </div>
            <div className="mt-10 ml-10">

              {inf && finalResult > 0 && <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-b-green-500 border-r-transparent"></div>}
              {sup && <div className="w-0 h-0  border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-t-red-500 border-r-transparent"></div>}
              {win && <div>Good guess</div>}
            </div>
          </div>
          <div className="mt-20">

            <div className="flex justify-center items-center">
              <div className="flex flex-row rounded-lg border border-teal-500 ">
                <span className="flex justify-center text-teal-500 py-[20px] w-[260px] ">{result}</span>
                <span className="flex justify-center items-center mx-auto text-white bg-teal-500 rounded text-xl w-[40px]">{numberGenerated.toString().split('').map(() => '*')}</span>
              </div>

            </div>
            <div className="grid grid-cols-3 gap-4 w-[300px] mx-auto mt-[70px]">
              {
                digits.map((value, i) => (
                  <input key={i} type="button" disabled={!started} className={inputStyle({ started: started })} value={value} onClick={() => onSelect(value)} />
                ))
              }
            </div>
          </div>
          <div className="flex justify-end">
            <span className="flex justify-center items-center text-3xl font-medium text-white rounded-full bg-red-600 w-[100px] h-[100px] ">{trysLeft} Left</span>
          </div>
        </div>
        <h1 className='text-2xl font-bold text-teal-700 flex justify-center mt-[100px]'>Leaderboard</h1>
        <div className="flex justify-center mt-10 bg-teal-100">

          <table className="">
            <thead  >
              <tr>
                <th className="pb-4">Position</th>
                <th className="pb-4">User</th>
                <th className="pb-4">Highscore</th>
              </tr>
            </thead>

            {leaderboard?.map((value, i) => (
              <tbody key={i} className="mt-[50px]">
                <tr>
                  <td>#{i + 1}</td>
                  <td className="px-4">{value.name}</td>
                  <td>{value.highScore}</td>
                </tr>
              </tbody>
            ))}
          </table>

        </div>
      </div>}
    </div>
  );
}
const inputStyle = ({ started }: { started: boolean }) => classNames('cursor-pointer bg-teal-500 text-white text-xl h-[90px] p-[10px]  font-bold rounded-full', {
  "bg-teal-800": !started
})
export default App;