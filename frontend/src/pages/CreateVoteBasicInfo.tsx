import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import StyledBackground from '../components/background/StyledBackground';
import ThinGradientButton from '../components/buttons/ThinGradientButton';
import '../components/logo/Banner.css';
import Heading from '../components/buttons/Heading';

export default function CreateVoteBasicInfo() {
    const navigate = useNavigate();

    const [electionName, setElectionName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [images, /*setImages*/] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [/*endDate, setEndDate*/] = useState<string>('');
    const [requireVerification, setRequireVerification] = useState<boolean>(true);
    const [locationOfVote, setLocationOfVote] = useState<string | undefined>('');

    const goBack = () => {
        navigate('/creator/view-voting-sessions');
    }

    const debounceRef = useRef<boolean>(false);

    const createElectionWithDetails = useCallback(async (): Promise<void> => {
        // console.log(startDate); // ''

        const DateObj = new Date(startDate); // e.g. 5 October 2014 / 14:00
        console.log(localStorage.getItem('user-session-id'));
        console.log('cather', electionName, description, images, startDate, requireVerification, locationOfVote);
        // const ISODate = stringDate.toISOString();
        const params = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': localStorage.getItem('user-session-id') || ''
            },
            body: JSON.stringify({
                title: electionName,
                description: description,
                images: images,
                startDate: DateObj,
                endDate: DateObj, /* for now */
                zid_requirement: requireVerification,
                locationOfVote: locationOfVote
            }),
        };
        const API_URL = import.meta.env.VITE_BACKEND_URL;

        // submit form on continue
        try {
            const fetchResponse = await fetch(`${API_URL}/api/auth/createElection`, params);
            const data = await fetchResponse.json();
            console.log(data);

            if (data && data.electionId) {
                let gotoURL = (`/creator/create-vote/${data.electionId}/positions`)
                console.log(gotoURL)
                navigate(gotoURL)
            } 

            return data;
        } catch (e) {
            console.log('caught')
            console.log('error: ', e);
        }

        console.log(DateObj);
        console.log(params);
    }, [electionName, description, images, startDate, requireVerification, locationOfVote]);

    useEffect(() => {
        console.log(electionName, description, images, startDate, requireVerification, locationOfVote);
    }, [electionName, description, images, startDate, requireVerification, locationOfVote]);

    const goToAddPositions = () => { // submit
        if (debounceRef.current) return;

        debounceRef.current = true;

        setTimeout(() => {
            debounceRef.current = false;
        }, 1000);

        createElectionWithDetails();
        // navigate('/creator/create-vote/positions');
    }

    return (
        <StyledBackground className='main'>
            <div className="
                flex flex-col overflow-y-auto no-scrollbar gap-[1.5em] 
                h-[100vh]
                pt-[0rem]
                p-[6rem]
            ">
                <button className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10" onClick={goBack}>
                    ←
                </button>

                <div className="w-full max-w-3xl mx-auto px-4">
                    <div className='mb-4'>
                        <Heading text="Create a New Vote" />
                    </div>

                    <div className="border-2 border-[#f1e9e9] bg-linear-130 from-transparent to-white/30 backdrop-blur-sm rounded-4xl p-6 md:p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="voteName" className="text-white text-lg">
                                    Vote Name
                                </label>
                                <input
                                    id="voteName"
                                    type="text"
                                    placeholder="DevSoc AGM Voting 2025"
                                    className="w-full p-3 rounded-md bg-white text-black"
                                    value={electionName}
                                    onChange={(e) => setElectionName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="location" className="text-white text-lg">
                                        Location
                                    </label>
                                    <input
                                        id="location"
                                        type="text"
                                        placeholder="F10 Junge Griffith M17"
                                        className="w-full p-3 rounded-md bg-white text-black"
                                        value={locationOfVote}
                                        onChange={(e) => setLocationOfVote(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="dateTime" className="text-white text-lg">
                                        Date / Time
                                    </label>
                                    <input
                                        id="dateTime"
                                        type="text"
                                        placeholder="Thu 2 October 2014, 14:45"
                                        className="w-full p-3 rounded-md bg-white text-black"
                                        value={startDate}
                                        onChange={(e) => { setStartDate(e.target.value); }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-white text-lg">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    className="w-full p-3 rounded-md bg-white text-black"
                                    placeholder={`This meeting will be held to receive executive reports for 2024 📝, propose and approve amendments to our Club's constitution as well as announce our new Executive team for the next 12 months!

    Executive will also showcase all the new features developed under our current development.`}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <button className="flex items-center gap-2 text-white">
                                    <span>Add image</span>
                                    <div className="hover:cursor-pointer hover:opacity-50 bg-linear-130 border-[0.5px] from-white/30 rounded-full flex flex-col items-center justify-center p-4 h-2 w-2">
                                        +
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center">
                                <span className="text-white text-lg">Require zID verification for voters</span>
                                <label className="relative inline-flex ml-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={requireVerification}
                                        onChange={() => setRequireVerification(!requireVerification)}
                                    />
                                    <div className="w-11 h-6 bg-[#a2a2a2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b1bb2]"></div>
                                </label>
                            </div>

                            <div className="flex justify-center mt-6">
                                <ThinGradientButton text="Continue" margin="mt-2" onClick={() => goToAddPositions()} w={'w-30'} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StyledBackground>
    );
}
