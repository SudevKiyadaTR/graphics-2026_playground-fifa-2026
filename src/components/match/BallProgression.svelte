<script>
  export let matchStats = {};
  export let homeTeam = '';
  export let awayTeam = '';

  const getTeamStats = (teamId, stats) => {
    const teamStats = stats[teamId] || [];
    const statMap = {};
    teamStats.forEach(([key, value]) => {
      statMap[key] = value;
    });
    return statMap;
  };

  const teamIds = Object.keys(matchStats);
  const homeTeamId = teamIds[0];
  const awayTeamId = teamIds[1];

  const homeStats = getTeamStats(homeTeamId, matchStats);
  const awayStats = getTeamStats(awayTeamId, matchStats);

  // Ball progression success
  const ballProgression = {
    home: homeStats.AttemptedBallProgressions && homeStats.CompletedBallProgressions
      ? ((homeStats.CompletedBallProgressions / homeStats.AttemptedBallProgressions) * 100).toFixed(0)
      : 0,
    away: awayStats.AttemptedBallProgressions && awayStats.CompletedBallProgressions
      ? ((awayStats.CompletedBallProgressions / awayStats.AttemptedBallProgressions) * 100).toFixed(0)
      : 0
  };

  // Line break completion
  const lineBreaks = {
    home: homeStats.LinebreaksAttempted && homeStats.LinebreaksAttemptedCompleted
      ? ((homeStats.LinebreaksAttemptedCompleted / homeStats.LinebreaksAttempted) * 100).toFixed(0)
      : 0,
    away: awayStats.LinebreaksAttempted && awayStats.LinebreaksAttemptedCompleted
      ? ((awayStats.LinebreaksAttemptedCompleted / awayStats.LinebreaksAttempted) * 100).toFixed(0)
      : 0
  };

  // Switch completion
  const switches = {
    home: homeStats.AttemptedSwitchesOfPlay && homeStats.CompletedSwitchesOfPlay
      ? ((homeStats.CompletedSwitchesOfPlay / homeStats.AttemptedSwitchesOfPlay) * 100).toFixed(0)
      : 0,
    away: awayStats.AttemptedSwitchesOfPlay && awayStats.CompletedSwitchesOfPlay
      ? ((awayStats.CompletedSwitchesOfPlay / awayStats.AttemptedSwitchesOfPlay) * 100).toFixed(0)
      : 0
  };
</script>

<div class="container">
  <h3>Decision-Making Quality</h3>

  <div class="metrics">
    <div class="metric">
      <div class="label">Ball Progression Success</div>
      <div class="bars">
        <div class="bar-row home">
          <span class="team-name">{homeTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {ballProgression.home}%"></div>
          </div>
          <span class="percent">{ballProgression.home}%</span>
        </div>
        <div class="bar-row away">
          <span class="team-name">{awayTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {ballProgression.away}%"></div>
          </div>
          <span class="percent">{ballProgression.away}%</span>
        </div>
      </div>
    </div>

    <div class="metric">
      <div class="label">Line Break Completion</div>
      <div class="bars">
        <div class="bar-row home">
          <span class="team-name">{homeTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {lineBreaks.home}%"></div>
          </div>
          <span class="percent">{lineBreaks.home}%</span>
        </div>
        <div class="bar-row away">
          <span class="team-name">{awayTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {lineBreaks.away}%"></div>
          </div>
          <span class="percent">{lineBreaks.away}%</span>
        </div>
      </div>
    </div>

    <div class="metric">
      <div class="label">Switch Completion</div>
      <div class="bars">
        <div class="bar-row home">
          <span class="team-name">{homeTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {switches.home}%"></div>
          </div>
          <span class="percent">{switches.home}%</span>
        </div>
        <div class="bar-row away">
          <span class="team-name">{awayTeam}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: {switches.away}%"></div>
          </div>
          <span class="percent">{switches.away}%</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .metrics {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .team-name {
    width: 50px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .bar-row.home .team-name {
    color: var(--color-home);
  }

  .bar-row.away .team-name {
    color: var(--color-away);
  }

  .bar-bg {
    flex: 1;
    height: 20px;
    background: var(--color-bg-raised);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--color-accent-3);
    transition: width 0.2s;
  }

  .bar-row.away .bar-fill {
    background: var(--color-accent-1);
  }

  .percent {
    min-width: 35px;
    text-align: right;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
</style>
