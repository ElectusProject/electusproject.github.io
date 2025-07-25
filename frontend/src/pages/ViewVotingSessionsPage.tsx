import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router';
import StyledBackground from "../components/background/StyledBackground";
import WideButton from "../components/buttons/WideButton";
import Heading from "../components/buttons/Heading";
import SmallButton from "../components/buttons/SmallButton";
import WideAddButton from "../components/buttons/WideAddButton";
import logoutIcon from "../assets/svg/logout.svg";
import { Election } from "../../../shared/interfaces";
import { useVoteCreateContext } from "../state/VoteCreateContext";

export default function ViewVotingSessionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const debounceRef = useRef<boolean>(false);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const { state, dispatch } = useVoteCreateContext();

  useEffect(() => {
    if (!isFetching) {
      setIsFetching(true);
      (async () => {
        if (debounceRef.current) return;
        debounceRef.current = true;
        setTimeout(() => (debounceRef.current = false), 1000);

        try {
          const res = await fetch(`${API_URL}/api/auth/viewElections`, {
            headers: {
              'x-session-id': localStorage.getItem('user-session-id') || ''
            }
          });
          if (!res.ok) throw new Error("Failed to fetch voting sessions");
          const data = await res.json();
          dispatch({ type: "SET_ELECTIONS", payload: data.result.elections })
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          setIsFetching(false);
        }
      })();
    }
  }, [API_URL, dispatch, isFetching]);

  const handleStart = (vote_id_input: number) => navigate(`/creator/voting-in-session/${vote_id_input}`);
  const handleResults = (vote_id_input: number) => {

    const find_election = state.elections.find((e) => String(e.id).match(String(vote_id_input)));

    if (find_election !== undefined && find_election !== null) {

      if (find_election.electionState !== 2) {
        window.alert("Vote needs to be finished to view results")
      } else {
        navigate(`/creator/results/${vote_id_input}`)
      };
    }
  }

  const handleDeletion = async (vote_id_input: number) => {
    const res = await fetch(`${API_URL}/api/auth/deleteElection`, {
      headers: {
        'x-session-id': localStorage.getItem('user-session-id') || '',
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
      body: JSON.stringify({ electionID: JSON.stringify(vote_id_input) }),
    });
    if (!res.ok) throw new Error("Failed to delete voting session");
    window.location.reload();
  };
  const handleAddSession = () => navigate('/creator/create-vote');
  const handleLogout = () => navigate('/');

  return (
    <StyledBackground className="main">
      <div className="relative h-[100vh] p-[6rem] overflow-y-auto no-scrollbar">
        {/* logout */}
        <button
          className="p-4 absolute md:top-2 md:right-4 md:z-20 sm:top-0 sm:right-8 top-0 right-10 hover:cursor-pointer"
          onClick={handleLogout}
          disabled={loading}
        >
          <img className="h-[40px]" src={logoutIcon} />
        </button>

        {/* semi-transparent overlay + spinner */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-50">
            <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12" />
          </div>
        )}

        {/* content */}
        <div className={`${loading ? 'opacity-50 pointer-events-none' : ''} flex flex-col gap-[1.5em] pt-0`}>
          <Heading text="Your Voting Sessions" />

          {state.elections.map((session: Election, idx) => (
            <div onClick={() => {
              // console.log(session)
              navigate(`/creator/create-vote/${session.id}/positions`)
            }} key={idx} className="flex items-center justify-center gap-[2vw]">
              <WideButton text={session.name} margin="mt-[0]" >
                <div className="buttons-container" style={{ zIndex: 100 }}>
                  <SmallButton
                    buttonType="start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(session.id);
                    }}
                    disabled={loading}
                  />

                  <SmallButton
                    buttonType="results"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResults(session.id);
                    }}
                    disabled={loading}
                  />

                  <SmallButton
                    buttonType="bin"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletion(session.id);
                    }}
                    disabled={loading}
                  />

                </div>
              </WideButton>
            </div>
          ))}

          <WideAddButton onClick={handleAddSession} disabled={loading} />
        </div>
      </div>
    </StyledBackground>
  );
}
