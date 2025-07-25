import { useEffect, useRef, useState } from "react";
import StyledBackground from "../components/background/StyledBackground";
import SampleQRButton from "../components/buttons/SampleQRButton";
import ZidContainers from "../components/containers/ZidContainers";
import { useNavigate, useParams } from "react-router";
import { useVoteCreateContext } from "../state/VoteCreateContext";
import { Election } from "../../../shared/interfaces";

interface OrganiserInput {
  name: string;
}

// Main VoteSessionPage component
export default function VoteSessionPage({ name }: OrganiserInput) {
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  // zidList is for DISPLAYING in the view/list.
  const [zidList, setZidList] = useState<string[]>([]); // [z1234567, z2345678]
  const [count, setCount] = useState<number>(-1); // number of voters in the session
  const [curElectionState, setCurElection] = useState<Election | null>(null);



  const [headerText, setHeaderText] = useState("Loading");
  const [buttonText, setButtonText] = useState("Loading");

  const debounceRef = useRef<boolean>(false);


  async function HandleButtonAction() {

    // WAITING TO START
    if (curElectionState?.electionState === 0) {



      if (debounceRef.current) return;
      debounceRef.current = true;
      setTimeout(() => (debounceRef.current = false), 1000);



      try {
        const res = await fetch(`${API_URL}/api/elections/activateSession/${curElectionState.id}`, {
          headers: {
            'x-session-id': localStorage.getItem('user-session-id') || ''
          },
          method: "POST"
        });
        if (!res.ok) throw new Error("Failed to fetch voting sessions");
        const data = await res.json();

        // setVotingSessions(data.result.elections);
      } catch (err: any) {
        console.error(err);
        window.alert(err.message || "An unknown error occurred");




      } finally {
        setLoading(false);
        setIsFetching(false);

        setTimeout(() => {
          window.location.reload()
        }, 1000);
      }

    }
    // HAS ALREADY STARTED i.e STOP VOTE
    else if (curElectionState?.electionState === 1) {
      console.log("STOPPING VOTE")


      try {
        const res = await fetch(`${API_URL}/api/elections/endElection/${curElectionState.id}`, {
          headers: {
            'x-session-id': localStorage.getItem('user-session-id') || ''
          },
          method: "POST"
        });
        if (!res.ok) throw new Error("Failed to fetch voting sessions");
        const data = await res.json();

        console.log("END ELECTION RESULT")
        console.log(data)
      } catch (error) {
        console.log(error);
      } finally {

        setTimeout(() => {
          window.location.reload()
        }, 1000);
      }

    }
    // Else stopped
    else {
      console.log("vote already stopped")
    }




  }


  function InitalDataLoad(input_election: Election) {
    console.log("INITAL LOAD");
    if (input_election === null) {
      console.log("HERE 2");
      setHeaderText("Invalid election ID");
    } else {
      console.log("HERE 3");
      console.log(input_election);
      switch (input_election.electionState) {
        case (0):
          setHeaderText("Waiting to start session");
          setButtonText("Start Session")
          return;
        case (1):
          setHeaderText("Voting session has started");
          setButtonText("Stop Vote Session")

          return;
        case (2):
          setHeaderText("Vote stopped");
          setButtonText("Vote Stopped")

          return;
      }
    }
  }

  const navigate = useNavigate();
  const { vote_id } = useParams();
  const { state, dispatch } = useVoteCreateContext();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

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
              "x-session-id": localStorage.getItem("user-session-id") || "",
            },
          });
          if (!res.ok) throw new Error("Failed to fetch voting sessions");
          const data = await res.json();
          dispatch({ type: "SET_ELECTIONS", payload: data.result.elections });

          let electionsFind: Election[] = data.result.elections;
          console.log("FOUND ELECTIONS");
          console.log(electionsFind);
          console.log(vote_id);

          let find_election = electionsFind.find((e) =>
            String(e.id).match(String(vote_id))
          );
          console.log(find_election);

          if (find_election !== undefined && find_election !== null) {
            console.log("FOUND ELECTION");
            console.log(find_election);
            setCurElection(find_election);
            InitalDataLoad(find_election);
          }
        } catch (err: any) {
          console.error(err);
          window.alert(err.message || "An unknown error occurred");
        } finally {
          setLoading(false);
          setIsFetching(false);
        }
      })();
    }
  }, []);

  useEffect(() => {
    setLoading(false); // once correct information has been loaded, change to false
  }, [zidList]);

  useEffect(() => {
    // TODO: "there is 1 voter in this session." <- ideal text
    setCount(zidList.length); // there are 2 voters in this session.
  }, [zidList]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (curElectionState?.electionState === 1) {
      // Start polling every 5 seconds
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/viewElections`, {
            headers: {
              'x-session-id': localStorage.getItem('user-session-id') || ''
            }
          });
          if (!res.ok) throw new Error("Failed to fetch voter list");
          const data = await res.json();

          console.log("VIEW ELECTION RESULT")
          console.log(data)


          if (data.result && data.result.elections) {
            const elections: Election[] = data.result.elections;
            console.log(elections)

            const findElection = elections.find((e) => String(e.id).match(vote_id));

            if (findElection !== undefined && findElection !== null) {
              console.log("FOUND ELECTION")
              console.log(findElection)

              let voters = findElection.voters.length

              console.log("VOTERS LENGTH")
              console.log(voters)
              setCount(voters);
            }

          }

          if (Array.isArray(data.result?.voters)) {
            const newZids = data.result.voters.map((v: any) => v.zid); // Adjust if voter shape differs
            setZidList(newZids);
          }
        } catch (err: any) {
          console.error("Polling error:", err.message || err);
        }
      }, 5000);
    }

    // Clean up interval on unmount or when electionState changes
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [curElectionState]);


  const goBack = () => {
    // exit voting session & navigate back to all voting sessions
    navigate("/creator/view-voting-sessions");
  };

  return (
    <>
      {loading ? (
        <StyledBackground className="main flex justify-center items-center">
          <div className="text-4xl mb-20 text-[#F1E9E9]">
            Starting Vote: {name}...
          </div>
        </StyledBackground>
      ) : (
        <StyledBackground className="main">
          <button
            className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10"
            onClick={goBack}
          >
            ←
          </button>
          <div className="flex self-center text-2xl mt-10 text-[#F1E9E9]">
            {headerText}
          </div>
          <div id="box-of-voters-in-session" className="mt-8">
            <div className="sm:w-full w-85 box-bg-style h-[40rem] p-12 text-center flex flex-col items-center text-2xl text-white border-1 border-[#F1E9E9] rounded-4xl">
              <div>
                There are {count} voters in this session.
              </div>
              <div>
                {curElectionState?.sessionCode && (<>Session Code: {curElectionState.sessionCode}</>)}
              </div>
              <div className="w-full h-full sm:w-100 sm:h-100 overflow-scroll m-8 no-scrollbar">
                {zidList.map((zid, index) => (
                  <ZidContainers
                    key={index}
                    width=""
                    height="h-10"
                    zid={zid}
                    zidList={zidList}
                    setZidList={setZidList}
                  />
                ))}
              </div>
              {/* TODO: QR Code Functionality */}
              {/* <div className="ml-100">
                <SampleQRButton />
              </div> */}

              <button
                onClick={() => {
                  // TODO: Start the voting session, passing through the list of voters
                  // navigate('/creator/view-voting-sessions');
                  HandleButtonAction()
                }}
                className="hover:opacity-85 text-xl cursor-pointer w-55 h-12 text-white text-center content-center border-1 border-[#F1E9E9] rounded-4xl backdrop-blur-2xl bg-gradient-to-br from-violet-950/70 to-white/10"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </StyledBackground>
      )}
    </>
  );
}