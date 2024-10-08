"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "./sidebar";
import { createClient } from "@supabase/supabase-js";
import { debounce, set, throttle } from "lodash";
import { useRouter } from "next/navigation";

const teams = [
	{ id: "01", name: "Faculty of Humanities" },
	{ id: "02", name: "Faculty of Education" },
	{ id: "03", name: "Faculty of Fine Arts" },
	{ id: "04", name: "Faculty of Social Sciences" },
	{ id: "05", name: "Faculty of Science" },
	{ id: "06", name: "Faculty of Engineering" },
	{ id: "07", name: "Faculty of Medicine" },
	{ id: "08", name: "Faculty of Agriculture" },
	{ id: "09", name: "Faculty of Dentistry" },
	{ id: "10", name: "Faculty of Pharmacy" },
	{ id: "11", name: "Faculty of Associated Medical Sciences" },
	{ id: "12", name: "Faculty of Nursing" },
	{ id: "13", name: "Faculty of Agro-Industry" },
	{ id: "14", name: "Faculty of Veterinary Medicine" },
	{ id: "15", name: "Faculty of Business Administration" },
	{ id: "16", name: "Faculty of Economics" },
	{ id: "17", name: "Faculty of Architecture" },
	{ id: "18", name: "Faculty of Mass Communication" },
	{ id: "19", name: "Faculty of Political Science" },
	{ id: "20", name: "Faculty of Law" },
	{ id: "21", name: "College of Media Arts and Technology" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Game() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [facultyId, setFacultyId] = useState("");
	const router = useRouter();

	useEffect(() => {
		const auth = localStorage.getItem("isAuthenticated");
		if (auth) {
			setIsAuthenticated(true);
		} else {
			router.push("/login");
		}

		if (isAuthenticated) {
			const facultyId = localStorage.getItem("facultyId");
			if (!facultyId) {
				localStorage.clear();
				router.push("/login");
				return;
			}
			setFacultyId(facultyId);
			setTeam(facultyId);
		}
	});

	const [clicks, setClicks] = useState(0);
	const [isClicked, setIsClicked] = useState(false);
	const [team, setTeam] = useState(facultyId);
	const [scores, setScores] = useState<{ [key: string]: number }>({
		...teams.reduce((acc, team) => ({ ...acc, [team.id]: 0 }), {}),
	});

	useEffect(() => {
		const ensureScore = async () => {
			const { data, error } = await supabase.from("scores").select();
			if (error) {
				console.error("Could not fetch scores");
				return;
			}
			const missingScores = teams.filter(
				(team) => !data.some((score) => score.team_id === team.id)
			);
			if (missingScores.length > 0) {
				await Promise.all(
					missingScores.map(async (team) => {
						await supabase
							.from("scores")
							.insert({ team_id: team.id, score: 0 });
					})
				);
			}

			fetchScores();
		};

		const fetchScores = async () => {
			const { data, error } = await supabase.from("scores").select();
			if (error) {
				console.error("Could not fetch scores");
				return;
			}
			setScores(
				data.reduce(
					(acc, score) => ({ ...acc, [score.team_id]: score.score }),
					{}
				)
			);
		};

		ensureScore();
	}, []);

	useEffect(() => {
		const channel = supabase
			.channel("realtime scores")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "scores",
				},
				(payload) => {
					setScores((prevScores) => ({
						...prevScores,
						[payload.new.team_id]: payload.new.score,
					}));
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const debounceSaveScore = useCallback(
		debounce(async (teamId, newScore) => {
			try {
				await supabase
					.from("scores")
					.upsert({ team_id: teamId, score: newScore });
			} catch (error) {
				console.error(error);
				console.error("Could not save score");
			}
		}, 500),
		[]
	);

	const saveScore = async (teamId: string, newScore: number) => {
		try {
			await supabase
				.from("scores")
				.update({ score: newScore })
				.eq("team_id", teamId);
		} catch (error) {
			console.error(error);
			console.error("Could not save score");
		}
	};

	const handleClick = () => {
		setClicks(clicks + 1);
		setIsClicked(true);
		setScores((prevScores) => {
			// console.log(prevScores["01"]);
			console.log(team);
			const newScore = prevScores[team] + 1;
			saveScore(team, newScore);
			return {
				...prevScores,
				[team]: newScore,
			};
		});

		setTimeout(() => {
			setIsClicked(false);
		}, 100);

		// saveScore();
	};

	const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setTeam(e.target.value);
		setClicks(0);
	};

	const debouncedHandleClick = debounce(handleClick, 200);

	return (
		<div className="bg-[#D9D9D9] p-5 text-black font-['Copse']">
			<Sidebar teams={teams} score={scores} />
			<div className="team-select flex justify-center items-center gap-x-4">
				{teams[parseInt(facultyId) - 1] && (
					<p className="text-3xl">
						Team: {teams[parseInt(facultyId) - 1].name}
					</p>
				)}
			</div>
			<div className="flex justify-center items-center flex-col h-screen bg-[#D9D9D9]">
				<h1 className={"text-4xl " + (isClicked ? "bounce" : "")}>{clicks}</h1>
				<Image
					src="/popcat.png"
					alt="popcat"
					width={500}
					height={500}
					onClick={debouncedHandleClick}
					className="mt-10"
				/>
			</div>
		</div>
	);
}
