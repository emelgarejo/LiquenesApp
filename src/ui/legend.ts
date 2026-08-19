export function renderLegend(
  container: HTMLElement,
  options: { heatEnabled: boolean },
): void {
  container.hidden = false;
  container.innerHTML = `
    <h2>Leyenda</h2>
    <p class="legend-subtitle">Incidencia de líquenes</p>
    <ul>
      <li><span class="swatch good" aria-hidden="true"></span> Alto (≥70%)</li>
      <li><span class="swatch moderate" aria-hidden="true"></span> Medio (40%–69.9%)</li>
      <li><span class="swatch poor" aria-hidden="true"></span> Bajo (&lt;40%)</li>
    </ul>
    ${
      options.heatEnabled
        ? `<div class="heat-key" aria-label="Mapa de calor de contaminación: rojo Alto, amarillo Medio, verde Bajo">
      <p class="heat-key-title">Contaminación</p>
      <div class="heat-ramp" aria-hidden="true"></div>
      <div class="heat-labels" aria-hidden="true">
        <span>Alto</span>
        <span>Medio</span>
        <span>Bajo</span>
      </div>
    </div>`
        : ''
    }
  `;
}
