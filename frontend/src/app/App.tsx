import { BrowserRouter, Route, Routes } from 'react-router'
import MainPage from '../pages/MainPage'
import VoterPage from '../pages/VoterPage'
import CreatorPage from '../pages/CreatorPage'
import VoteSessionPage from '../pages/VoteSessionPage'
import ViewVotingSessionsPage from '../pages/ViewVotingSessionsPage'
import AddPositionsPage from '../pages/AddPositionsPage'
import CreateVoteBasicInfo from '../pages/CreateVoteBasicInfo'
import CreateVoteAddInfo from '../pages/CreateVoteAddInfo'
import CreateVoteEditCandidate from '../pages/CreateVoteEditCandidate'
import VoterVotingPage from '../pages/VoterVotingPage'
import VotingFinishPage from '../pages/VotingFinishPage'
import ResultsPage from '../pages/ResultsPage'
import VoterJoinSessionPage from '../pages/VoterJoinSessionPage'
import { VoteCreateProvider } from '../state/VoteCreateContext'

export default function App() {
    return (
        <BrowserRouter>
            <VoteCreateProvider>
                <Routes>
                    <Route path="/" element={<MainPage />} />

                    <Route path="/voter/login" element={<VoterPage />} />
                    <Route path="/voter/join" element={<VoterJoinSessionPage />} />
                    <Route path="/voter/voting/:id/:index" element={<VoterVotingPage />} />
                    <Route path="/voter/finish" element={<VotingFinishPage />} />

                    <Route path="/creator/login" element={<CreatorPage />} />
                    <Route path="/creator/view-voting-sessions" element={<ViewVotingSessionsPage />} />
                    <Route path="/creator/create-vote" element={<CreateVoteBasicInfo />} />
                    <Route path="/creator/create-vote/:vote_id/positions" element={<AddPositionsPage />} />
                    <Route path="/creator/create-vote/:vote_id/add-position" element={<CreateVoteAddInfo />} />
                    <Route path="/creator/create-vote/:vote_id/edit-position/:pos_id" element={<CreateVoteAddInfo />} />

                    {/* below route no longer a used a feature */}
                    <Route path="/creator/create-vote/:vote_id/edit-candidate/:id" element={<CreateVoteEditCandidate />} />

                    <Route path="/creator/voting-in-session/:vote_id" element={<VoteSessionPage name="DevSoc AGM Voting 2025" />} /> {/* template */}
                    <Route path="/creator/results/:vote_id" element={<ResultsPage />} />
                </Routes>
            </VoteCreateProvider>
        </BrowserRouter>
    )
}
