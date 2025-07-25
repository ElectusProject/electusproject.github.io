import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import StyledBackground from "../components/background/StyledBackground";
import WideButton from "../components/buttons/WideButton";
import Heading from "../components/buttons/Heading";
import SmallButton from "../components/buttons/SmallButton";
import WideAddButton from "../components/buttons/WideAddButton";
import ThinGradientButton from "../components/buttons/ThinGradientButton";
import { useVoteCreateContext } from "../state/VoteCreateContext";
import { Election, Question } from "../../../shared/interfaces";

export default function AddPositionsPage() {
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    // const [positions, setPositions] = useState<>([]);
    const debounceRef = useRef<boolean>(false);

    const [questions, SetQuestions] = useState<Question[]>([]);



    // const [votingSessions, setVotingSessions] = useState<Election[]>([]);

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
                            'x-session-id': localStorage.getItem('user-session-id') || ''
                        }
                    });
                    if (!res.ok) throw new Error("Failed to fetch voting sessions");
                    const data = await res.json();
                    dispatch({ type: "SET_ELECTIONS", payload: data.result.elections })

                    let electionsFind: Election[] = data.result.elections;
                    console.log("FOUND ELECTIONS")

                    console.log(electionsFind)

                    let find_election = electionsFind.find((e) => String(e.id).match(String(vote_id)))

                    if (find_election !== undefined && find_election !== null) {
                        SetQuestions(find_election.questions)
                    }
                    // setVotingSessions(data.result.elections);
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

    const handleReorder = (index: number, direction: 'up' | 'down') => {
        // setPositions(reorderElements(positions, index, direction));
    };

    const handleDeletion = (index: number) => {
        // setPositions(deleteElement(positions, index));
    }

    const navigate = useNavigate();
    const handleAddPositions = () => {
        navigate(`/creator/create-vote/${vote_id}/add-position`)
    }
    const goBack = () => {
        navigate(`/creator/view-voting-sessions`)
    }
    const navigateAllVotes = () => {
        navigate(`/creator/view-voting-sessions`)
    }

    return (
        <StyledBackground className='main'>
            {/* Add logout button */}

            <div className="
                flex flex-col overflow-y-auto no-scrollbar gap-[1.5em] 
                h-[100vh]
                pt-[0rem]
                p-[6rem]
            ">
                <button className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10" onClick={goBack}>
                    ←
                </button>
                <Heading text="Add Positions" />
                {questions.map((cur_question, index) => (
                    <div onClick={() => {

                        console.log("CLICK POSITION")
                        console.log(cur_question)
                        navigate(`/creator/create-vote/${vote_id}/edit-position/${cur_question.id}`)

                    }} key={index} className="flex flex-row justify-center items-center gap-[2vw]">
                        <WideButton text={cur_question.title} margin="mt-[0]">
                            <div className="buttons-container">
                                <SmallButton
                                    buttonType="up"
                                    onClick={() => handleReorder(index, 'up')}
                                    disabled={loading}
                                />
                                <SmallButton
                                    buttonType="down"
                                    onClick={() => handleReorder(index, 'down')}
                                    disabled={loading}
                                />
                            </div>
                        </WideButton>
                        <SmallButton buttonType="bin" onClick={() => handleDeletion(index)} disabled={loading} />
                    </div>
                ))}
                <WideAddButton onClick={() => handleAddPositions()} disabled={loading}></WideAddButton>
                <ThinGradientButton text="Save" margin="mt-2" onClick={navigateAllVotes} disabled={loading} w={'w-25'} />
            </div>
        </StyledBackground>
    )
}