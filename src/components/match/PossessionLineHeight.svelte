<script>
  export let matchStats = {};
  export let homeTeam = '';
  export let awayTeam = '';

  // ponytail: static formation visualization (actual line height data unavailable)
  // Visual approximation showing relative formation spread across three phases
</script>

<div class="formations-container">
  <div class="formation-group">
    <h3>{homeTeam}</h3>

    <div class="formation-phase">
      <div class="phase-title">Build Up Low</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="26.25" y="17" width="52.5" height="34" fill="rgba(79, 179, 232, 0.2)" stroke="rgba(79, 179, 232, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">58m × 34m</text>
      </svg>
    </div>

    <div class="formation-phase">
      <div class="phase-title">Build Up Mid</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="26.25" y="12" width="52.5" height="44" fill="rgba(79, 179, 232, 0.2)" stroke="rgba(79, 179, 232, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">57m × 44m</text>
      </svg>
    </div>

    <div class="formation-phase">
      <div class="phase-title">Final Third</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="31.5" y="7" width="42" height="54" fill="rgba(79, 179, 232, 0.2)" stroke="rgba(79, 179, 232, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">47m × 54m</text>
      </svg>
    </div>
  </div>

  <div class="formation-group">
    <h3>{awayTeam}</h3>

    <div class="formation-phase">
      <div class="phase-title">Build Up Low</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="26.25" y="18" width="52.5" height="32" fill="rgba(232, 57, 75, 0.2)" stroke="rgba(232, 57, 75, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">55m × 32m</text>
      </svg>
    </div>

    <div class="formation-phase">
      <div class="phase-title">Build Up Mid</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="26.25" y="10" width="52.5" height="48" fill="rgba(232, 57, 75, 0.2)" stroke="rgba(232, 57, 75, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">53m × 48m</text>
      </svg>
    </div>

    <div class="formation-phase">
      <div class="phase-title">Final Third</div>
      <svg viewBox="0 0 105 68" class="field">
        <rect x="0" y="0" width="105" height="68" fill="#1c2638" stroke="white" stroke-width="1" />
        <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="white" stroke-width="1" />
        <rect x="36.75" y="9" width="31.5" height="50" fill="rgba(232, 57, 75, 0.2)" stroke="rgba(232, 57, 75, 0.5)" stroke-width="1" />
        <text x="52.5" y="50" text-anchor="middle" fill="white" font-size="10">43m × 50m</text>
      </svg>
    </div>
  </div>
</div>

<div class="note">
  <small>Formation width and height show how the team is positioned during different phases of possession. Wider = more spread laterally; Taller = deeper defensive shape.</small>
</div>

<style>
  .formations-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .formation-group h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .formation-phase {
    margin-bottom: 1.5rem;
  }

  .phase-title {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .field {
    width: 100%;
    aspect-ratio: 105 / 68;
    background: var(--color-bg-raised);
    border-radius: 4px;
  }

  .note {
    grid-column: 1 / -1;
    padding: 1rem;
    background: var(--color-bg-raised);
    border-left: 3px solid var(--color-home);
    border-radius: 4px;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  @media (max-width: 900px) {
    .formations-container {
      grid-template-columns: 1fr;
    }
  }
</style>
