"use client";

import { useEffect, useState } from "react";

type Day = { date: string; count: number; level: number };

/** Number of most-recent weeks to show in the compact "mini" heatmap. */
const WEEKS_TO_SHOW = 20;

/** Group a flat, chronological list of days into GitHub-style week columns
 *  (each column is Sun..Sat, with leading/trailing gaps as null). */
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

/**
 * Compact GitHub contribution heatmap. Pulls the last year of public
 * contributions from a token-free API and renders the most recent weeks in a
 * green scale that matches the site's accent (theme-aware via CSS).
 */
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

  // Skeleton while loading: an empty grid so the layout doesn't jump.
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
