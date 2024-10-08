interface SidebarProps {
	teams: { id: string; name: string }[];
	score: { [key: string]: number };
}

const sortTeams = (
	teams: { id: string; name: string }[],
	score: { [key: string]: number }
) => {
	teams.sort((a, b) => {
		if (score[a.id] > score[b.id]) {
			return -1;
		} else if (score[a.id] < score[b.id]) {
			return 1;
		} else {
			return 0;
		}
	});
};

const filterTeams = (
	teams: { id: string; name: string }[],
	score: { [key: string]: number }
) => {
	return teams.filter((team) => score[team.id] > 0);
};

export default function Sidebar({ teams, score }: SidebarProps) {
	let cteam = structuredClone(teams);
	sortTeams(cteam, score);
	cteam = filterTeams(cteam, score);
	return (
		<aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-4">
			{cteam.map((team) => (
				<div key={team.id} className="scoreboard-item">
					<h2>
						{team.name}: {score[team.id]}
					</h2>
				</div>
			))}
			<div className="absolute bottom-4 w-full flex justify-left">
				<button
					onClick={() => {
						localStorage.clear();
						window.location.reload();
					}}
					className="text-white font-bold py-2 px-4 rounded border-white border-2"
				>
					Log Out
				</button>
			</div>
		</aside>
	);
}
