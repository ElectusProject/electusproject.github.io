import { useState } from "react";
import StyledBackground from "../components/background/StyledBackground";
import logoutIcon from "../assets/svg/logout.svg";
import { useNavigate } from "react-router";
import VotingSessionBox from "../components/containers/VotingSessionBox";

export default function VoterJoinSessionPage() { // once voter has logged in
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  }

  const [input, setInput] = useState<string>('');
  const onClick = () => {
    if (input.trim()) {
      const checkElectionSessionCode = async () => {
        const sessionCode = input;
        if (sessionCode) {
          //console.log("HELLOWORD 3")
          //console.log(sessionCode)
          const API_URL = import.meta.env.VITE_BACKEND_URL;
          let response = await fetch(`${API_URL}/api/elections/checkElectionSessionCode`, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(
              {
                sessionCode: sessionCode,
              }),
          });
          response = await fetch(`${API_URL}/api/voters/checkSessionState`, {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',

            body: JSON.stringify({ sessionCode: sessionCode }),
          });
          const sessionState = await response.json();
          if (sessionState.results == 2) {
            navigate("/voter/finish");
            return;
          }
          if (response.status == 200) {
            const sessionId = localStorage.getItem('user-session-id');
            fetch(`${API_URL}/api/elections/joinVote`, {
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
              body: JSON.stringify(
                {
                  sessionCode: sessionCode,
                  sessionId: sessionId
                }),
            });
            navigate(`/voter/voting/${input.trim()}/0`);
            return;
          }
        }
      };
      checkElectionSessionCode();
    }
  }


  return (
    <StyledBackground className="main justify-center">
      <button className="p-4 absolute top-2 right-4 z-10 hover:cursor-pointer" onClick={handleLogout}>
        <img className="h-[40px]" src={logoutIcon}></img>
      </button>
      <VotingSessionBox onClick={onClick} setInput={setInput} />

    </StyledBackground >
  );
}