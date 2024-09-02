"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import { createClient } from "@supabase/supabase-js";

const teams = [
  { id: "teamA", name: "Team A" },
  { id: "teamB", name: "Team B" },
  { id: "teamC", name: "Team C" },
  { id: "teamD", name: "Team D" },
  { id: "teamE", name: "Team E" },
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey)

export default function Game() {
  const [clicks, setClicks] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [team, setTeam] = useState("teamA")
  const [scores, setScores] = useState<{ [key: string]: number }>({ ...teams.reduce((acc, team) => ({ ...acc, [team.id]: 0 }), {}) });

  useEffect(() => {
    const ensureScore = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select();
      if (error) {
        console.error("Could not fetch scores")
        return;
      }
      const missingScores = teams.filter(team => !data.some(score => score.team_id === team.id));
      if (missingScores.length > 0) {
        await Promise.all(missingScores.map(async (team) => {
          await supabase
            .from('scores')
            .insert({ team_id: team.id, score: 0 });
        }));
      }

      fetchScores();
    }

    const fetchScores = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select();
      if (error) {
        console.error("Could not fetch scores")
        return;
      }
      setScores(data.reduce((acc, score) => ({ ...acc, [score.team_id]: score.score }), {}));
    }

    ensureScore();
  }, []);

  useEffect(() => {
    const channel = supabase.channel('realtime scores').on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'scores'
    }, (payload) => {
      setScores(prevScores => ({
        ...prevScores,
        [payload.new.team_id]: payload.new.score
      }))
    }).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const saveScore = async () => {
    try {
      await supabase
        .from('scores')
        .upsert({ team_id: team, score: scores[team] + 1 })
    } catch (error) {
      console.error(error);
      console.error("Could not save score");
    }
  };

  const handleClick = () => {
    setClicks(clicks + 1);
    setIsClicked(true);
    setScores(prevScores => ({
      ...prevScores,
      [team]: prevScores[team] + 1,
    }));

    setTimeout(() => {
      setIsClicked(false);
    }, 100);

    saveScore();
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeam(e.target.value);
    setClicks(0);
  }

  return (
    <div className="bg-[#D9D9D9] p-5 text-black">
      <Sidebar teams={teams} score={scores} />
      <div className="team-select flex justify-center items-center gap-x-4">
        <label htmlFor="team-select">Select Team:</label>
        <select id="team-select" value={team} onChange={handleTeamChange} className="w-64 p-2 border rounded appearance-none bg-white border border-gray-500 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline">
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-center items-center flex-col h-screen bg-[#D9D9D9]">
        <h1 className={"text-4xl " + (isClicked ? "bounce" : "")}>{clicks}</h1>
        <Image src="/popcat.png" alt="popcat" width={500} height={500} onClick={handleClick} className="mt-10" />
      </div>
    </div >
  )
}
