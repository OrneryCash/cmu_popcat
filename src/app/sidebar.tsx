interface SidebarProps {
  teams: { id: string, name: string }[];
  score: { [key: string]: number };
}

const sortTeams = (teams: { id: string, name: string }[], score: { [key: string]: number }) => {
  teams.sort((a, b) => {
    if (score[a.id] > score[b.id]) {
      return -1;
    } else if (score[a.id] < score[b.id]) {
      return 1;
    } else {
      return 0;
    }
  });
}


export default function Sidebar({ teams, score }: SidebarProps) {
  let cteam = structuredClone(teams)
  sortTeams(cteam, score);
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-4">
      {cteam.map(team => (
        <div key={team.id} className="scoreboard-item">
          <h2>{team.name}: {score[team.id]}</h2>
        </div>
      ))}
    </aside>
  )
} 
