import ThinGradientButton from "../buttons/ThinGradientButton";
import AuthInput from "../inputs/AuthInput";

interface VotingSessionBoxInputs {
  onClick: () => void,
  setInput: React.Dispatch<React.SetStateAction<string>>,
}

export default function VotingSessionBox({ onClick, setInput }: VotingSessionBoxInputs) {
  return (
    <div className="flex flex-col justify-center w-[20em] mt-25 mb-40 sm:w-[30em] h-[10em] sm:h-[12em] bg-linear-140 from-transparent to-white/40 sm:mb-60 border-2 border-[#f1e9e9] rounded-4xl">
      <div className="flex flex-row justify-center">
        <AuthInput type="text" label="Join a Voting Session" placeholder="Input Session ID" marginStyle="" setInput={setInput} w="w-[12em] sm:w-[16em]" h="h-[2.5em]" />
        <ThinGradientButton text={"Join"} margin={"mt-9 sm:ml-5 ml-0"} w={"w-20"} onClick={onClick} disabled={false} />
      </div>
    </div>
  )
}