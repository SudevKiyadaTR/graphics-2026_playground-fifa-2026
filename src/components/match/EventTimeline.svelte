<script>
  export let timeline = [];
  export let homeTeam = '';
  export let awayTeam = '';
  export let liveData = {};

  // ponytail: parse team IDs from live data to map events
  const getTeamName = (teamId) => {
    if (liveData.HomeTeam?.IdTeam === teamId) return homeTeam;
    if (liveData.AwayTeam?.IdTeam === teamId) return awayTeam;
    return 'Unknown';
  };

  const getPlayerName = (playerId) => {
    const allPlayers = [
      ...(liveData.HomeTeam?.Players || []),
      ...(liveData.AwayTeam?.Players || []),
    ];
    const player = allPlayers.find(p => p.IdPlayer === playerId);
    if (player?.PlayerName?.[0]?.Description) {
      return player.PlayerName[0].Description;
    }
    return `Player ${playerId}`;
  };

  // Map event Type integers to names
  const typeMap = {
    0: 'Goal',
    2: 'YellowCard',
    3: 'RedCard',
    5: 'Substitution'
  };

  // Filter key events only
  const keyEventTypeIds = [0, 2, 3, 5];
  const filteredEvents = Array.isArray(timeline)
    ? timeline
        .filter(e => keyEventTypeIds.includes(e.Type))
        .map(e => ({ ...e, eventTypeName: typeMap[e.Type] }))
    : [];

  const getEventIcon = (type) => {
    switch (type) {
      case 'Goal':
        return '⚽';
      case 'YellowCard':
        return '🟨';
      case 'RedCard':
        return '🟥';
      case 'Substitution':
        return '🔄';
      default:
        return '•';
    }
  };

  const getEventLabel = (type) => {
    return type.replace(/([A-Z])/g, ' $1').trim();
  };
</script>

<div class="timeline">
  {#if filteredEvents.length === 0}
    <div class="empty-message">No significant events recorded</div>
  {:else}
    {#each filteredEvents as event (event.EventId)}
      <div class="event" class:home-event={liveData.HomeTeam?.IdTeam === event.IdTeam}>
        <div class="event-time">{event.MatchMinute}</div>
        <div class="event-content">
          <div class="event-icon">{getEventIcon(event.eventTypeName)}</div>
          <div class="event-details">
            <div class="event-type">{getEventLabel(event.eventTypeName)}</div>
            <div class="event-team">{getTeamName(event.IdTeam)}</div>
            {#if event.IdPlayer}
              <div class="event-player">{getPlayerName(event.IdPlayer)}</div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .event {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-bg-raised);
    border-left: 3px solid var(--color-away);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .event.home-event {
    border-left-color: var(--color-home);
  }

  .event-time {
    font-weight: 700;
    color: var(--color-text-primary);
    min-width: 40px;
  }

  .event-content {
    display: flex;
    gap: 0.75rem;
    flex: 1;
  }

  .event-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .event-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .event-type {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .event-team {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .event-player {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .empty-message {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 1rem;
  }
</style>
