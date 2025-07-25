// import React from "react";
import { useEffect, useRef, useState } from "react";
import ThinGradientButton from "../buttons/ThinGradientButton";
import AuthInput from "../inputs/AuthInput"
import '../AuthBox.css'
import { Link, useLocation, useNavigate } from "react-router";
import { useVoteCreateContext } from "../../state/VoteCreateContext";

interface AuthBoxInput {
	user: string,
}


export default function AuthBox({ user }: AuthBoxInput) {
	const [navTo, setNavTo] = useState<string>('');
	const [signupLogin, setSignupLogin] = useState<'Sign up' | 'Login'>('Login');

	const location = useLocation();
	const route = location.pathname;


	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');


	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);


	useEffect(() => {
		if (route === `/${user}/signup`) {
			setNavTo(`/${user}/login`);
			setSignupLogin('Sign up');
		} else if (route === `/${user}/login`) {
			setNavTo(`/${user}/signup`);
			setSignupLogin('Login');
		}
	}, [route]);

	const navigate = useNavigate();
	const goBack = () => {
		navigate('/');
	}

	async function login() {
		const API_URL = import.meta.env.VITE_BACKEND_URL;

		const res = await fetch(`${API_URL}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(
				{
					zId: username,
					zPass: password
				}),
		});
		const data = await res.json();
		// if (!res.ok) throw new Error(data.error || 'Login failed');
		return data; // { sessionId: ... }
	}

	async function register() {
		const API_URL = import.meta.env.VITE_BACKEND_URL;

		const res = await fetch(`${API_URL}/api/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(
				{
					zId: username,
					zPass: password
				}),
		});
		const data = await res.json();
		// if (!res.ok) throw new Error(data.error || 'Login failed');
		return data; // { sessionId: ... }
	}

	const { state, dispatch } = useVoteCreateContext();


	const debounceRef = useRef<boolean>(false);

	/**
	 * This is what happens when we get a session ID
	 * Handle storing it as a cookie and redirecting
	 * @param sessionId 
	 */
	function HandleFoundSessionid(sessionId: string) {
		console.log("HANDLING SESSION ID");
		console.log(sessionId)
		localStorage.setItem('user-session-id', sessionId); // session id stored in local storage
		dispatch({
			type: "SET_USERNAME",
			payload: username
		})
		if (route.includes('creator')) {
			navigate(`/creator/view-voting-sessions`);
		} else if (route.includes('voter')) {
			navigate('/voter/join');
		}
	}

	const submit = async () => {
		if (debounceRef.current) return;
		debounceRef.current = true;
		setTimeout(() => (debounceRef.current = false), 1000);

		setErrorMsg(null);
		setLoading(true);
		try {
			const res2 = await login();

			if (res2.error) {
				if (res2.error === 'Incorrect password') {
					setErrorMsg('Incorrect password');
				} else {
					// window.alert(res2.error);
				}
			} else if (res2.sessionId) {
				HandleFoundSessionid(res2.sessionId);
			}

			if (res2.error === 'User not registered') {
				const res3 = await register();
				if (res3.error) {
					window.alert(res3.error);
				} else if (res3.sessionId) {
					HandleFoundSessionid(res3.sessionId);
				}
			}

		} catch (err) {
			window.alert(err || 'Login failed');
		} finally {
			setLoading(false);
		}
	};



	return (
		<div className="…">
			{/* … */}
			<AuthInput
				type="text"
				label="zID"
				placeholder="z1234567"
				marginStyle="mt-[2em]"
				setInput={setUsername}
				w="w-[19em] sm:w-[23em]"
				h="h-[2.5em]"
				disabled={loading}
			/>
			<AuthInput
				type="password"
				label="Password"
				placeholder="••••••••••••"
				marginStyle="mt-[1em]"
				setInput={setPassword}
				w="w-[19em] sm:w-[10em]"
				h="h-[2.5em]"
				disabled={loading}
			/>

			{errorMsg && (
				<div className="text-red-500 ml-24 mt-2 text-sm">
					{errorMsg}
				</div>
			)}

			<ThinGradientButton
				text={loading ? 'Loading…' : 'Continue'}
				margin="mt-10"
				w="sm:w-[23em] w-[18em]"
				onClick={submit}
				disabled={loading}
			/>
		</div>
	);

}