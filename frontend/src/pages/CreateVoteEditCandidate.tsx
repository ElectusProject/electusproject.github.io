import { useState } from 'react';
import { useNavigate } from 'react-router';
import StyledBackground from '../components/background/StyledBackground';
import ThinGradientButton from '../components/buttons/ThinGradientButton';
import '../components/logo/Banner.css';
import Heading from '../components/buttons/Heading';

export default function CreateVoteEditCandidate() {
  const [name, setName] = useState("Alexia Lebrun")
  const [description, setDescription] = useState("I LOVE DEVSOC!")

  const navigate = useNavigate();
  const goBack = () => {
    navigate('/creator/create-vote/add-position');
  }

  return (
    <StyledBackground className='main'>
      <button className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10" onClick={goBack}>
        ←
      </button>

      <div className="w-full max-w-3xl mx-auto px-4 pt-16">
        <div className='mb-4'>
          <Heading text="Edit Candidate" />
        </div>

        <div className="border-2 border-[#f1e9e9] bg-linear-130 from-violet-950/40 to-white/30 backdrop-blur-sm !rounded-4xl p-6 md:p-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-white text-lg">
                Candidate Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 !rounded-md bg-white text-black"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-white text-lg">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 !rounded-md bg-white text-black"
              />
            </div>

            <div>
              <button type="button" className="flex items-center gap-2 text-white">
                <span>Add an image</span>
                <div className="hover:cursor-pointer hover:opacity-50 bg-linear-130 border-[0.5px] from-white/30 !rounded-full flex flex-col items-center justify-center p-4 h-2 w-2">
                  +
                </div>
              </button>
            </div>

            <div className="flex justify-center mt-6">
              <ThinGradientButton text="Save" margin="mt-2" onClick={goBack} w={'w-25'} disabled={false}/>
            </div>
          </form>
        </div>
      </div>
    </StyledBackground>
  )
} 