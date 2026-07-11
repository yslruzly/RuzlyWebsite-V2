"use client";

import { useEffect, useState } from "react";

type Day = { date: string; count: number; level: number };

// how many recent weeks of activity to show
const WEEKS_TO_SHOW = 20;

// groups the flat list of days into week columns like github does
// (each column is Sun to Sat, nulls fill the gaps at the start and end)
function buildWeeks(days: Day[]): (Day | null)[][] {
  const weeks: (Day | null)[][] = [];
  let current: (Day | null)[] = new Array(7).fill(null);
  for (const d of days) {
    const weekday = new Date(d.date + "T00:00:00").getDay(); // 0 Sun .. 6 Sat
    if (weekday === 0 && current.some(Boolean)) {
      weeks.push(current);
      current = new Array(7).fill(null);
    }
    current[weekday] = d;
  }
  if (current.some(Boolean)) weeks.push(current);
  return weeks;
}

// My github contribution graph, the green squares in the Experience section.
// Pulls the last year of activity from a free public API (no token needed)
// and draws the recent weeks. If the API ever dies it just falls back to a
// plain link to my github profile.
export default function GitHubHeatmap({ username }: { username: string }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { contributions: Day[] }) => {
        if (active) setDays(data.contributions ?? []);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [username]);

  // show an empty grid while loading so nothing jumps when the data lands
  const skeleton: (Day | null)[][] = Array.from({ length: WEEKS_TO_SHOW }, () =>
    new Array(7).fill(null)
  );
  const weeks = days ? buildWeeks(days).slice(-WEEKS_TO_SHOW) : skeleton;
  const total = days ? days.reduce((sum, d) => sum + d.count, 0) : null;

  if (failed) {
    return (
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[11px] tracking-wide text-ash transition-colors hover:text-paper"
      >
        github.com/{username} ↗
      </a>
    );
  }

  return (
    <div aria-label="GitHub contribution activity for the last year">
      <div className="mb-3 flex items-baseline justify-between gap-4 font-mono text-[11px] tracking-widest text-ash uppercase">
        <span>GitHub activity</span>
        {total !== null && (
          <span className="text-mist normal-case">
            {total.toLocaleString()} contributions
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day, j) => (
              <div
                key={j}
                className={`gh-cell ${day ? `gh-lvl-${day.level}` : "gh-lvl-0"}`}
                title={
                  day
                    ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-ash">
        <span>Less</span>
        <span className="gh-cell gh-lvl-0" />
        <span className="gh-cell gh-lvl-1" />
        <span className="gh-cell gh-lvl-2" />
        <span className="gh-cell gh-lvl-3" />
        <span className="gh-cell gh-lvl-4" />
        <span>More</span>
      </div>
    </div>
  );
}
