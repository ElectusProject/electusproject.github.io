import { useNavigate } from "react-router";
import StyledBackground from "../components/background/StyledBackground";
// import Heading from "../components/buttons/Heading";
import MedHeading from "../components/buttons/MedHeading";


export default function VotingFinishPage() {

    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    }
    return (
        <StyledBackground className='main'>
            <div className="
                flex flex-col justify-center items-center
                h-[80vh]
                text-center
            ">
                <MedHeading text="The voting process is now complete!"></MedHeading>
                <MedHeading text="Thank you for participating."></MedHeading>
                <button
                    className="mt-10 px-6 py-3 text-white rounded text-4xl opacity-100 hover:opacity-70 transition-opacity duration-200"
                    onClick={goBack}
                >
                    ←
                </button>
            </div>
        </StyledBackground>
    )
}