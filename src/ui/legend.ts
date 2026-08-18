export function renderLegend(
  container: HTMLElement,
  options: { heatEnabled: boolean },
): void {
  container.hidden = false;
  container.innerHTML = `
    <h2>Leyenda</h2>
    <ul>
      <li><span class="swatch good" aria-hidden="true"></span> Alto (≥70% incidencia)</li>
      <li><span class="swatch moderate" aria-hidden="true"></span> Medio (40%–69.9%)</li>
      <li><span class="swatch poor" aria-hidden="true"></span> Bajo (&lt;40%)</li>
      ${
        options.heatEnabled
          ? '<li><span class="swatch heat" aria-hidden="true"></span> Halo degradado por semáforo; cerca de otro color se difumina/mezcla</li>'
          : ''
      }
    </ul>
  `;
}
