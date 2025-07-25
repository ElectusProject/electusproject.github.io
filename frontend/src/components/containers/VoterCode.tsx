import { useState } from "react"
import OrganiserButton from "../buttons/VotingOrganiserButton"
import SampleQRButton from "../buttons/SampleQRButton"
import AuthInput from "../inputs/AuthInput"
import "./VoterCode.css"

interface VoterCodeInput {
  zidList: string[],
  setZidList: React.Dispatch<React.SetStateAction<string[]>>,
}

export default function VoterCode({ zidList, setZidList }: VoterCodeInput) {
  const [inputVoterCode, setInputVoterCode] = useState<string>('');

  // TODO: Backend integration with frontend 
  // -- use inputVoterCode e.g. ABC123 to get backend to generate and return a userSessionId
  // -- AND also to get the relative zID associated with the VoterCode

  // const [zid, setZid] = useState<string>(''); // NOTE THIS NEEDS BACKEND TO MATCH THE SESSION ID TO FIND THE CORRECT ZID TO PUT INTO ZIDLIST FOR DISPLAY

  return (
    <>
      <div className='box-bg-style !rounded-4xl w-[10rem] md:w-[30rem] md:h-[14rem] p-12'>
        <div className="flex flex-row mb-5">
          <AuthInput type="text" setInput={setInputVoterCode} h="h-[2.5em]" w="w-70" label="Voter's code" placeholder="ABC123" marginStyle="ml-2" />
          <div className="mt-7 ml-5">  {/* note - could do a marginStyle for SampleQRButton like AuthInput */}
            <SampleQRButton /> {/* currently disabled functionality */}
          </div>
        </div>

        {/* commented out next line is the correct code - requires backend data to make it work though */}
        {/* <OrganiserButton text="Add" zid={zid} width="" height="h-10" zidList={zidList} setZidList={setZidList} /> */}
        <OrganiserButton text="Add" zid={inputVoterCode} width="w-95" height="h-10" zidList={zidList} setZidList={setZidList} />
      </div>
    </>
  )
}