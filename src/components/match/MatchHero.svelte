<script>
  export let match = {};
  export let liveData = {};

  const getTeamName = (team) => {
    if (Array.isArray(team.TeamName)) {
      return team.TeamName[0]?.Description || 'Team';
    }
    return String(team.TeamName || 'Team');
  };

  const homeTeamName = getTeamName(liveData.HomeTeam || {});
  const awayTeamName = getTeamName(liveData.AwayTeam || {});
  const homeTactics = liveData.HomeTeam?.Tactics || '-';
  const awayTactics = liveData.AwayTeam?.Tactics || '-';

  const stadiumName = liveData.Stadium?.Name?.[0]?.Description || liveData.Stadium?.Name || 'Stadium';
  const attendance = liveData.Attendance ? parseInt(liveData.Attendance).toLocaleString() : '-';
</script>

<div class="hero">
  <div class="match-info">
    <div class="teams-row">
      <div class="team home">
        <div class="team-name">{homeTeamName}</div>
        <div class="tactics">({homeTactics})</div>
      </div>

      <div class="score-box">
        <div class="score">
          {match.homeScore !== null ? match.homeScore : '-'}
          <span class="separator">-</span>
          {match.awayScore !== null ? match.awayScore : '-'}
        </div>
        <div class="meta">
          <span>{match.stage}</span>
          <span>•</span>
          <span>{match.group}</span>
        </div>
        <div class="subline">
          <span>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>•</span>
          <span>{stadiumName}</span>
          <span>•</span>
          <span>Attendance: {attendance}</span>
        </div>
      </div>

      <div class="team away">
        <div class="team-name">{awayTeamName}</div>
        <div class="tactics">({awayTactics})</div>
      </div>
    </div>
  </div>
</div>

<style>
  .hero {
    margin-bottom: var(--space-2xl);
  }

  .match-info {
    padding: var(--space-xl);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin-bottom: var(--space-lg);
  }

  .teams-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
  }

  .team {
    flex: 1;
    text-align: center;
  }

  .team-name {
    font: var(--font-display-sm);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }

  .tactics {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .score-box {
    flex: 1.4;
    text-align: center;
  }

  .score {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1;
    margin-bottom: var(--space-md);
  }

  .separator {
    display: inline-block;
    margin: 0 var(--space-sm);
  }

  .meta {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
  }

  .subline {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    margin-top: var(--space-sm);
  }

  @media (max-width: 768px) {
    .teams-row {
      flex-direction: column;
      gap: var(--space-lg);
    }

    .score {
      font-size: 2.5rem;
    }
  }
</style>
