import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import StyledBackground from '../components/background/StyledBackground';
import ThinGradientButton from '../components/buttons/ThinGradientButton';
import '../components/logo/Banner.css';
import editIcon from '../assets/svg/edit.svg';
import binIcon from '../assets/svg/bin.svg';
import Heading from '../components/buttons/Heading';

interface Position {
  id: number;
  title: string;
  questionType: string;
}

interface Candidate {
  name: string;
  description?: string;
  image?: string;
  candidateIndex?: number;
}

export default function CreateVoteAddInfo() {
  const navigate = useNavigate();
  const { vote_id, pos_id } = useParams();
  const isEditMode = Boolean(pos_id);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState("");
  const [positionName, setPositionName] = useState("");
  const [votingType, setVotingType] = useState("preferential");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentPositionId, setCurrentPositionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Debouncing refs
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingApiCalls = useRef<Set<string>>(new Set());

  // Get session ID from localStorage
  const getSessionId = () => {
    return localStorage.getItem('user-session-id') || '';
  };

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Debounced API call helper
  const debounce = useCallback((key: string, fn: () => Promise<void>, delay: number = 300) => {
    // Clear existing timeout for this key
    if (debounceTimeouts.current.has(key)) {
      clearTimeout(debounceTimeouts.current.get(key)!);
    }

    // Prevent duplicate calls
    if (pendingApiCalls.current.has(key)) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      pendingApiCalls.current.add(key);
      try {
        await fn();
      } finally {
        pendingApiCalls.current.delete(key);
        debounceTimeouts.current.delete(key);
      }
    }, delay);

    debounceTimeouts.current.set(key, timeoutId);
  }, []);



  const apiCall = async (url: string, options: RequestInit = {}) => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };
  // Load initial data on component mount
  useEffect(() => {
    if (vote_id) {
      loadInitialData();
    }
  }, [vote_id, pos_id]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      if (isEditMode && pos_id) {
        // Load existing position data
        await loadExistingPosition();
      } else {
        // Initialize with default candidates for new position
        setCandidates([
          { name: "Alexia Lebrun" },
          { name: "Patrick Cooper" },
          { name: "Lina Pasquier" },
          { name: "Timothy Stevens" }
        ]);
        setPositionName("President");
      }

      await loadPositions();
      setInitialDataLoaded(true);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingPosition = async () => {
    if (!pos_id) return;

    try {
      console.log("CANDIDATE RESPONSE -2")

      // Load position details from positions list
      const positionsResponse = await apiCall(`/api/auth/viewPositions/${vote_id}`);
      console.log(positionsResponse)
      const position = positionsResponse.result?.positions?.find((p: Position) => p.id === Number(pos_id));
      console.log("CANDIDATE RESPONSE -1")

      if (position) {
        console.log("CANDIDATE RESPONSE 0")

        setPositionName(position.title);
        setVotingType(position.questionType);
        setCurrentPositionId(Number(pos_id));

        // Load candidates for this position
        const candidatesResponse = await apiCall(`/api/auth/votes/${vote_id}/positions/${pos_id}/candidates`);
        console.log("CANDIDATE RESPONSE 1")
        console.log(candidatesResponse)
        setCandidates(candidatesResponse.result || []);
      }
    } catch (error) {
      console.error('Failed to load existing position:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const response = await apiCall(`/api/auth/viewPositions/${vote_id}`);
      setPositions(response.result || []);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const addCandidate = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCandidate.trim()) {
      const candidateName = newCandidate.trim();
      const debounceKey = `add-candidate-${candidateName}`;

      // Optimistically update UI
      setCandidates(prev => [...prev, { name: candidateName }]);
      setNewCandidate("");

      if (isEditMode && currentPositionId) {
        debounce(debounceKey, async () => {
          try {
            await apiCall('/api/auth/createCandidate', {
              method: 'POST',
              body: JSON.stringify({
                voteId: Number(vote_id),
                positionId: currentPositionId,
                name: candidateName
              })
            });
          } catch (error) {
            console.error('Failed to add candidate:', error);
            // Revert optimistic update on error
            setCandidates(prev => prev.filter(c => c.name !== candidateName));
          }
        });
      }
    }
  };

  const startEditingCandidate = (index: number) => {
    setEditingIndex(index);
    setEditingName(candidates[index].name);
  };

  const saveEditCandidate = async (index: number) => {
    if (!editingName.trim()) return;

    const newName = editingName.trim();
    const debounceKey = `edit-candidate-${index}-${newName}`;

    // Optimistically update UI
    const updatedCandidates = [...candidates];
    const oldName = updatedCandidates[index].name;
    updatedCandidates[index] = {
      ...updatedCandidates[index],
      name: newName
    };
    setCandidates(updatedCandidates);
    setEditingIndex(null);
    setEditingName("");

    if (isEditMode && currentPositionId) {
      debounce(debounceKey, async () => {
        try {
          await apiCall('/api/auth/editCandidate', {
            method: 'POST',
            body: JSON.stringify({
              voteId: Number(vote_id),
              positionId: currentPositionId,
              candidateIndex: candidates[index].candidateIndex ?? index,
              name: newName,
              description: candidates[index].description || "",
              image: candidates[index].image || ""
            })
          });
        } catch (error) {
          console.error('Failed to edit candidate:', error);
          // Revert optimistic update on error
          setCandidates(prev => {
            const reverted = [...prev];
            reverted[index] = { ...reverted[index], name: oldName };
            return reverted;
          });
        }
      });
    }
  };

  const cancelEditCandidate = () => {
    setEditingIndex(null);
    setEditingName("");
  };

  const removeCandidate = async (index: number) => {
    const candidateToRemove = candidates[index];
    const debounceKey = `remove-candidate-${index}`;

    // Optimistically update UI
    setCandidates(prev => prev.filter((_, i) => i !== index));

    if (isEditMode && currentPositionId) {
      debounce(debounceKey, async () => {
        try {
          await apiCall(`/api/auth/votes/${vote_id}/positions/${currentPositionId}/${candidateToRemove.candidateIndex ?? index}`, {
            method: 'DELETE'
          });
        } catch (error) {
          console.error('Failed to remove candidate:', error);
          // Revert optimistic update on error
          setCandidates(prev => {
            const reverted = [...prev];
            reverted.splice(index, 0, candidateToRemove);
            return reverted;
          });
        }
      });
    }
  };

  const deletePosition = async () => {
    if (!isEditMode || !currentPositionId) return;

    if (window.confirm('Are you sure you want to delete this position? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await apiCall(`/api/auth/deletePosition/${vote_id}/${currentPositionId}`, {
          method: 'DELETE'
        });
        navigate(`/creator/create-vote/${vote_id}/positions`);
      } catch (error) {
        console.error('Failed to delete position:', error);
        alert('Failed to delete position. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    navigate(`/creator/create-vote/${vote_id}/positions`);
  };


  const handleSavePosition = () => {
    // guard early (optional), like you had before
    if (!positionName.trim() || (!isEditMode && !votingType)) {
      alert('Please fill in all required fields');
      return;
    }

    // debounce key must be unique
    const debounceKey = 'create-position';

    debounce(debounceKey, async () => {
      try {
        setIsLoading(true);

        if (isEditMode) {
          // edit-mode just navigates back
          navigate(`/creator/create-vote/${vote_id}/positions`);
        } else {
          // 1) create the position
          const response = await apiCall('/api/auth/createPosition', {
            method: 'POST',
            body: JSON.stringify({
              voteId: Number(vote_id),
              title: positionName.trim(),
              questionType: votingType
            })
          });

          const positionId = response.result?.positionId;
          if (!positionId) throw new Error('Position creation failed');

          // 2) then batch-create the candidates
          const candidatePromises = candidates.map((candidate, index) =>
            new Promise(resolve =>
              setTimeout(() => {
                apiCall('/api/auth/createCandidate', {
                  method: 'POST',
                  body: JSON.stringify({
                    voteId: Number(vote_id),
                    positionId,
                    name: candidate.name
                  })
                })
                  .then(resolve)
                  .catch(resolve);
              }, index * 100)
            )
          );

          await Promise.all(candidatePromises);
          navigate(`/creator/create-vote/${vote_id}/positions`);
        }
      } catch (error) {
        console.error('Failed to save position:', error);
        alert('Failed to save position. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, /* delay= */ 300);
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      saveEditCandidate(index);
    } else if (e.key === 'Escape') {
      cancelEditCandidate();
    }
  };

  if (!initialDataLoaded) {
    return (
      <StyledBackground className='main'>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </StyledBackground>
    );
  }

  return (
    <StyledBackground className='main'>
      <div className="
        flex flex-col overflow-y-auto no-scrollbar gap-[1.5em] 
        h-[100vh]
        pt-[0rem]
        p-[6rem]
    ">
        <button
          className="hover:cursor-pointer text-white p-4 text-2xl absolute top-2 left-4 z-10"
          onClick={goBack}
          disabled={isLoading}
        >
          ←
        </button>

        <div className="w-full max-w-3xl mx-auto px-4">
          <div className='mb-4 flex justify-between items-center'>
            <Heading text={isEditMode ? "Edit Position" : "Add a New Position"} />
            {isEditMode && (
              <button
                onClick={deletePosition}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-md transition-colors"
                disabled={isLoading}
              >
                Delete Position
              </button>
            )}
          </div>

          {/* Container starts here */}
          <div className="border-2 border-[#f1e9e9] bg-linear-130 from-violet-950/35 to-white/30 backdrop-blur-sm rounded-4xl p-6 md:p-8 w-90 sm:w-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="position" className="text-white text-lg">
                  Position Name
                </label>
                <input
                  id="position"
                  type="text"
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  className="w-full p-3 rounded-md bg-white text-black"
                  disabled={isLoading}
                />
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <label htmlFor="voting-type" className="text-white text-lg">
                    Voting Type
                  </label>
                  <select
                    id="voting-type"
                    value={votingType}
                    onChange={(e) => setVotingType(e.target.value)}
                    className="w-full p-3 rounded-md bg-white text-black focus:outline-none"
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Select a voting type
                    </option>
                    <option value="first-past-the-post">First-past-the-post (Only one preference)</option>
                    <option value="preferential">Preferential (Numbered preferences)</option>
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-white text-lg">Candidates</label>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="flex items-center justify-between border border-[#f1e9e9] bg-linear-130 from-violet-950/20 to-white/25 rounded-full px-4 py-3">
                      <div className="flex-grow text-center text-white">
                        {editingIndex === index ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, index)}
                            onBlur={() => saveEditCandidate(index)}
                            className="w-full bg-transparent text-white text-center focus:outline-none border-b border-white/50"
                            autoFocus
                            disabled={isLoading}
                          />
                        ) : (
                          candidate.name
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {editingIndex === index ? (
                          <>
                            <button
                              className="hover:cursor-pointer p-1.5 border border-[#f1e9e9] bg-green-500/20 rounded-md text-white text-xs"
                              onClick={() => saveEditCandidate(index)}
                              disabled={isLoading}
                            >
                              ✓
                            </button>
                            <button
                              className="hover:cursor-pointer p-1.5 border border-[#f1e9e9] bg-red-500/20 rounded-md text-white text-xs"
                              onClick={cancelEditCandidate}
                              disabled={isLoading}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="hover:cursor-pointer p-1.5 border border-[#f1e9e9] bg-white/5 rounded-md"
                              onClick={() => startEditingCandidate(index)}
                              disabled={isLoading}
                            >
                              <img src={editIcon} alt="Edit" className="w-4 h-4" />
                            </button>
                            <button
                              className="hover:cursor-pointer p-1.5 border border-[#f1e9e9] bg-white/5 rounded-md"
                              onClick={() => removeCandidate(index)}
                              disabled={isLoading}
                            >
                              <img src={binIcon} alt="Delete" className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <input
                    type="text"
                    value={newCandidate}
                    onChange={(e) => setNewCandidate(e.target.value)}
                    onKeyDown={addCandidate}
                    placeholder="Type a name to add..."
                    className="w-full px-6 py-3 bg-white/5 border border-[#f1e9e9] rounded-full text-white placeholder-white/70 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <ThinGradientButton
                  text={isLoading ? "Saving..." : "Save"}
                  margin="mt-2"
                  onClick={handleSavePosition}
                  w={'w-30'}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledBackground>
  )
}