import { useEffect } from "react";
import { NavigateFunction } from "react-router";

export function deleteElement(arr: string[], index: number) {
    const newArr = [...arr];
    newArr.splice(index, 1);
    return newArr;
}

export function reorderElements(arr: string[], index: number, direction: 'up' | 'down') {
    const newArr = [...arr];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // check out of bounds
    if (targetIndex < 0 || targetIndex >= arr.length) return arr;

    // swap elements
    const temp = newArr[index]
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    return newArr;
};

// code repetition in CreatorPage and VoterPage - both use the same UseEffect
export function loginUseEffect(navigate: NavigateFunction, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    useEffect(() => {
        const checkSession = async () => {
            const sessionId = localStorage.getItem('user-session-id');
            if (sessionId) {
                const API_URL = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${API_URL}/api/auth/checkSession`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            sessionId: sessionId,
                        }),
                });
                if (response.ok) {
                    // navigate('/voter/join');
                    navigate('/creator/view-voting-sessions');
                    return;
                }
            }
            // No valid session
            setLoading(false);
        };

        checkSession();
    }, [navigate]);
}