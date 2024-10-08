"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const [currentLogo, setCurrentLogo] = useState("/logo1.jpeg");

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentLogo((prevLogo) =>
				prevLogo === "/logo1.jpeg" ? "/logo2.jpeg" : "/logo1.jpeg"
			);
		}, 5000); // Change logo every 5 seconds

		return () => clearInterval(interval); // Cleanup on component unmount
	}, []);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();

		// Match the regex pattern for student ID
		const studentIDPattern =
			/^(6[3-7])(0[1-9]|1[0-9]|20|21)([0-5])([0-7])\d{3}$/;

		if (!studentIDPattern.test(password)) {
			alert("Invalid student ID");
			return;
		}

		localStorage.setItem("isAuthenticated", "true");
		localStorage.setItem("facultyId", password[2] + password[3]);
		router.push("/");
	};

	return (
		<div className="flex h-screen w-screen bg-white lg:bg-[url('/backgroundLogin.png')] justify-center items-center lg:items-start bg-cover font-['Copse'] lg:pl-[400px] xl:pl-[450px] lg:pt-[5%] box-border">
			<div className="flex flex-col justify-center items-center w-full xl:w-[75%] border-black border-2 rounded-[25px] px-5 xl:px-10 py-5 xl:min-w-[500px] xl:max-w-[75%] max-w-[90%] box-border">
				<img
					src={currentLogo}
					alt="logo"
					className={`mb-4 h-12 xl:h-20 box-border`}
				/>
				<h2 className="mb-4 text-black text-2xl lg:text-4xl">Log in</h2>
				<form
					onSubmit={handleLogin}
					className="flex flex-col items-center w-full"
				>
					<input
						type="text"
						id="username"
						placeholder="Full Name"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						className="mb-4 p-4 border border-gray-300 rounded-full w-full text-xl xl:text-2xl text-black"
					/>
					<input
						type="password"
						id="password"
						placeholder="Student ID"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="mb-4 p-4 border border-gray-300 rounded-full w-full text-xl xl:text-2xl text-black"
					/>
					<button
						type="submit"
						className="p-4 bg-[#D9D9D9] text-black rounded-full w-full m-9 text-2xl xl:text-3xl"
					>
						Confirm
					</button>
				</form>
			</div>
		</div>
	);
}
