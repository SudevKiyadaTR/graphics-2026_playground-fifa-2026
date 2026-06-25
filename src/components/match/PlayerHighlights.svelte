<script>
  export let playerStats = {};
  export let homeTeam = '';
  export let awayTeam = '';

  const parsePlayerStats = () => {
    const players = [];
    Object.entries(playerStats).forEach(([playerId, stats]) => {
      const statMap = {};
      stats.forEach(([key, value]) => {
        statMap[key] = value;
      });

      const goals = statMap.Goals || 0;
      const assists = statMap.Assists || 0;
      const shots = statMap.AttemptAtGoal || 0;
      const passes = statMap.PassesAccurate || 0;

      if (goals > 0 || assists > 0 || shots >= 3 || passes >= 20) {
        players.push({
          id: playerId,
          goals,
          assists,
          shots,
          passes,
          impact: goals * 3 + assists * 2 + (shots > 0 ? 1 : 0) + (passes > 0 ? 0.1 : 0),
        });
      }
    });

    return players.sort((a, b) => b.impact - a.impact).slice(0, 6);
  };

  const topPlayers = parsePlayerStats();

  const getImpactLevel = (impact) => {
    if (impact >= 10) return 'Star';
    if (impact >= 5) return 'Key';
    return 'Active';
  };
</script>

<div class="highlights">
  {#if topPlayers.length === 0}
    <div class="empty-message">No detailed player data available</div>
  {:else}
    <div class="player-grid">
      {#each topPlayers as player (player.id)}
        <div class="player-card">
          <div class="player-impact" class:star={getImpactLevel(player.impact) === 'Star'} class:key={getImpactLevel(player.impact) === 'Key'}>
            {getImpactLevel(player.impact)}
          </div>
          <div class="player-stats">
            {#if player.goals > 0}
              <div class="stat">
                <span class="icon">⚽</span>
                <span class="value">{player.goals}</span>
              </div>
            {/if}
            {#if player.assists > 0}
              <div class="stat">
                <span class="icon">🎯</span>
                <span class="value">{player.assists}</span>
              </div>
            {/if}
            {#if player.shots > 0}
              <div class="stat">
                <span class="icon">🔫</span>
                <span class="value">{player.shots}</span>
              </div>
            {/if}
            {#if player.passes > 0}
              <div class="stat">
                <span class="icon">📍</span>
                <span class="value">{player.passes}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .highlights {
    min-height: 200px;
  }

  .player-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .player-card {
    background: var(--color-bg-raised);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s;
  }

  .player-card:hover {
    border-color: var(--color-home);
    box-shadow: 0 2px 8px rgba(79, 179, 232, 0.1);
  }

  .player-impact {
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-surface);
    border-radius: 3px;
    text-align: center;
    color: var(--color-text-secondary);
  }

  .player-impact.star {
    background: var(--color-home);
    color: white;
  }

  .player-impact.key {
    background: var(--color-away);
    color: white;
  }

  .player-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .icon {
    font-size: 1rem;
  }

  .value {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .empty-message {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 2rem 1rem;
  }
</style>
