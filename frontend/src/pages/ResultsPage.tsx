import { useNavigate, useParams } from "react-router";
import StyledBackground from "../components/background/StyledBackground";
import Heading from "../components/buttons/Heading";
import WinnerPane from "../components/buttons/WinnerPane";
import { useEffect, useRef, useState } from "react";
import { Election, Question} from "../../../shared/interfaces";
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

import confetti from 'canvas-confetti';



export default function ResultsPage() {
    function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function launchConfettiBurst() {
  confetti({
    angle: randomInRange(55, 125),
    spread: randomInRange(50, 70),
    particleCount: Math.floor(randomInRange(50, 100)),
    origin: { y: 0.6 },
  });
}



    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    // const [positions, setPositions] = useState<>([]);
    const debounceRef = useRef<boolean>(false);
    

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const {vote_id} = useParams();


    interface Results {
        voteName: string,
        winners: {
            position: string,
            name: string,
            extraInfo?: string,
        }[]
    }



    const [voteResults, setVoteResults] = useState<Results[] | null>(null);
    const [voteTitle, setVoteTitle] = useState<string | null>(null);



function calculatePreferentialWinner(question: Question): Results {
    const { candidates, ballot: ballots, title } = question;
    
    // Validate and clean ballots - remove duplicates and invalid indices
    const validBallots = ballots
        .map(ballot => {
            // Remove duplicates while preserving order and filter valid indices
            const cleanPreferences: number[] = [];
            const seen = new Set<number>();
            
            for (const pref of ballot.preferences) {
                if (pref >= 0 && pref < candidates.length && !seen.has(pref)) {
                    cleanPreferences.push(pref);
                    seen.add(pref);
                }
            }
            
            return {
                ...ballot,
                preferences: cleanPreferences
            };
        })
        .filter(ballot => ballot.preferences.length > 0);
    
    // Count first preference votes for extra info
    const firstPreferenceCounts = new Map<number, number>();
    for (let i = 0; i < candidates.length; i++) {
        firstPreferenceCounts.set(i, 0);
    }
    
    // Count first preferences
    validBallots.forEach(ballot => {
        if (ballot.preferences.length > 0) {
            const firstChoice = ballot.preferences[0];
            firstPreferenceCounts.set(firstChoice, firstPreferenceCounts.get(firstChoice)! + 1);
        }
    });
    
    // Create first preference summary for extra info
    const firstPrefSummary = candidates
        .map((candidate, index) => `${candidate.name}: ${firstPreferenceCounts.get(index) || 0}`)
        .join(', ');
    
    // Start IRV algorithm
    const activeCandidateIndices = new Set<number>();
    for (let i = 0; i < candidates.length; i++) {
        activeCandidateIndices.add(i);
    }
    
    while (activeCandidateIndices.size > 1) {
        // Count current votes for each active candidate
        const voteCounts = new Map<number, number>();
        activeCandidateIndices.forEach(candidateIndex => {
            voteCounts.set(candidateIndex, 0);
        });
        
        // Count votes based on highest preference for active candidates
        validBallots.forEach(ballot => {
            for (const preference of ballot.preferences) {
                if (activeCandidateIndices.has(preference)) {
                    voteCounts.set(preference, voteCounts.get(preference)! + 1);
                    break; // Found the highest preference active candidate
                }
            }
        });
        
        const totalVotes = Array.from(voteCounts.values()).reduce((sum, votes) => sum + votes, 0);
        
        // Check if any candidate has majority (>50%)
        const majority = Math.floor(totalVotes / 2) + 1;
        const candidateWithMajority = Array.from(voteCounts.entries())
            .find(([_, votes]) => votes >= majority);
        
        if (candidateWithMajority) {
            // We have a winner
            const winnerIndex = candidateWithMajority[0];
            const winner = candidates[winnerIndex];
            
            return {
                voteName: title,
                winners: [{
                    position: title,
                    name: winner.name,
                    extraInfo: `1st preferences: ${firstPrefSummary}`
                }]
            };
        }
        
        // No majority - eliminate candidate(s) with lowest votes
        const minVotes = Math.min(...Array.from(voteCounts.values()));
        const candidatesToEliminate = Array.from(voteCounts.entries())
            .filter(([_, votes]) => votes === minVotes)
            .map(([candidateIndex]) => candidateIndex);
        
        // Remove eliminated candidates
        candidatesToEliminate.forEach(candidateIndex => {
            activeCandidateIndices.delete(candidateIndex);
        });
        
        // If we're down to one candidate, they win
        if (activeCandidateIndices.size === 1) {
            const winnerIndex = Array.from(activeCandidateIndices)[0];
            const winner = candidates[winnerIndex];
            
            return {
                voteName: title,
                winners: [{
                    position: title,
                    name: winner.name,
                    extraInfo: `1st preferences: ${firstPrefSummary}`
                }]
            };
        }
    }
    
    // Fallback - should not reach here in normal circumstances
    return {
        voteName: title,
        winners: []
    };
}


    function CalculateVoteResults(input_election: Election) {

        // const example_questions: Question[] = [
        //     {
        //         "id": 504483359,
        //         "title": "asdf",
        //         "candidates": [
        //             {
        //                 "name": "asdf",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 579342419
        //             },
        //             {
        //                 "name": "asdf",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 464391844
        //             },
        //             {
        //                 "name": "asdfasdfasdf",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 957946584
        //             },
        //             {
        //                 "name": "asdfadsfasdfa",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 23380445
        //             }
        //         ],
        //         questionType: 0,
        //         "ballot": [
        //             {
        //                 userid: "a",
        //                 preferences: [0, 1, 2, 3]
        //             },
        //             {
        //                 userid: "b",
        //                 preferences: [0, 3, 2, 1]
        //             },
        //             {
        //                 userid: "c",
        //                 preferences: [2, 1, 3, 1]      
        //             }
        //         ]
        //     },
        //                 {
        //         "id": 504483359,
        //         "title": "asdf",
        //         "candidates": [
        //             {
        //                 "name": "Cheese Man",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 579342419
        //             },
        //             {
        //                 "name": "Dog Boy",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 464391844
        //             },
        //             {
        //                 "name": "Hurler",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 957946584
        //             },
        //             {
        //                 "name": "Demon",
        //                 "description": "",
        //                 "image": "",
        //                 "candidateIndex": 23380445
        //             }
        //         ],
        //         questionType: 0,
        //         "ballot": [
        //             {
        //                 userid: "a",
        //                 preferences: [3, 2, 1, 0]
        //             },
        //             {
        //                 userid: "b",
        //                 preferences: [3, 4, 2, 1]
        //             },
        //             {
        //                 userid: "c",
        //                 preferences: [0, 1, 2, 3]      
        //             }
        //         ]
        //     }

        // ]

        const win_results: Results[] = []

        // example_questions.forEach((cur_q, index) => {

        input_election.questions.forEach((cur_q, index) => {
            const res2 = calculatePreferentialWinner(cur_q);
            
            console.log("CALC WINNER: " + index)
            console.log(res2)
            win_results.push(res2)

        })
        console.log("WIN")
        console.log(win_results)

        setVoteResults(win_results)

        // let result1 = calculatePreferentialWinner(example_questions)


    }


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

                const electionsFind: Election[] = data.result.elections;
                const find_election = electionsFind.find((e) => String(e.id).match(String(vote_id)))

                if (find_election !== undefined && find_election !== null) {
                    setVoteTitle(find_election.name)
                    console.log("FOUND ELECTION")
                    console.log(find_election)
                    CalculateVoteResults(find_election)
                    setTimeout(() => launchConfettiBurst(), 600);
                    // SetQuestions(find_election.questions)
                }
                // setVotingSessions(data.result.elections);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
            })();
        }
      }, []);



    // const results: Results = {
    //     voteName: 'DevSoc AGM Voting 2025',
    //     winners: [
    //         {
    //             position: 'Treasurer',
    //             name: 'Matthew Stewart'
    //         },
    //         {
    //             position: 'GEDI Officer',
    //             name: 'Alexander Taylor'
    //         },
    //         {
    //             position: 'Co-president (Project Operations)',
    //             name: 'Alexander Taylor'
    //         },
    //         {
    //             position: 'Co-president (Project Operations)',
    //             name: 'Alexander Taylorf asldfjkaksjd flaksjdfl aksjdflasdf'
    //         }
    //     ]
    // };

    const navigate = useNavigate();
    const goBack = () => {
        navigate('/creator/view-voting-sessions')
    }

  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
    launchConfettiBurst();
  };
    return (
        <StyledBackground className='main'>

            {voteResults !== null && <div className="
                flex flex-col overflow-y-auto no-scrollbar gap-[1.5em] 
                h-[100vh]
                pt-[0rem]
                p-[6rem]
            ">
                <button className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10" onClick={goBack}>
                    ←
                </button>
                <Heading text={`${voteTitle} Results`} />

<Carousel activeIndex={index} onSelect={handleSelect} interval={null}>
            {voteResults.map((curVote, idx) => (
                <Carousel.Item key={idx}>
                <div className="flex justify-center items-center min-h-[500px] ">
                    {curVote.winners.length > 0 ? (
                    <WinnerPane
                        winner={{
                        name: curVote.winners[0].name,
                        position: curVote.winners[0].position,
                        extraInfo: curVote.winners[0].extraInfo,
                        }}
                    />
                    ) : (
                    <WinnerPane
                        winner={{
                        name: "No winner",
                        position: curVote.voteName,
                        extraInfo:
                            "No candidate received a majority or no votes were cast.",
                        }}
                    />
                    )}
                </div>
                </Carousel.Item>
            ))}
            </Carousel>


                
            </div>}
            <style>
    {`
    
.carousel-control-prev,
.carousel-control-next {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 3rem !important;
  height: 3rem !important;
  background: none !important;
  border: none !important;
  z-index: 10 !important;
  transition: none !important; /* prevents Bootstrap transition effect */
  outline: none !important;
  box-shadow: none !important;
}

.carousel-control-prev {
  left: -5rem !important;
}

.carousel-control-next {
  right: -5rem !important;
}

    `}
  </style>
            {voteResults === null && <div className="
                flex flex-col overflow-y-auto no-scrollbar gap-[1.5em] 
                h-[100vh]
                pt-[0rem]
                p-[6rem]
            ">
                <button className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10" onClick={goBack}>
                    ←
                </button>
                        <Heading text={`Loading...`} />

            </div>}
        </StyledBackground>
    )
}