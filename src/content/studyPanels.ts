export type StudyPanelId = 'ficha' | 'investigacion' | 'integrantes';

export interface StudyPanelContent {
  id: StudyPanelId;
  title: string;
  html: string;
}

export const STUDY_PANELS: Record<StudyPanelId, StudyPanelContent> = {
  ficha: {
    id: 'ficha',
    title: 'Ficha técnica',
    html: `
      <p class="panel-lead">Criterios y muestreo usados en el mapa de Urbanización Chama.</p>
      <dl class="panel-dl">
        <div><dt>Institución</dt><dd>Colegio Particular Cristo Salvador — 6° B</dd></div>
        <div><dt>Área</dt><dd>Urbanización Chama, Santiago de Surco, Lima</dd></div>
        <div><dt>Límites</dt><dd>Av. Higuereta, Av. Benavides, Av. Valle del Sur y Av. Aviación</dd></div>
        <div><dt>Muestreo</dt><dd>5 jul 2026 – 18 ago 2026</dd></div>
        <div><dt>Sitios</dt><dd>10 puntos: 6 parques y 4 avenidas</dd></div>
        <div><dt>Indicador</dt><dd>Incidencia = árboles con líquenes ÷ árboles examinados</dd></div>
      </dl>
      <h3>Semáforo (incidencia)</h3>
      <ul class="panel-list">
        <li><strong>Alto</strong> — ≥ 70%</li>
        <li><strong>Medio</strong> — 40% a 69.9%</li>
        <li><strong>Bajo</strong> — &lt; 40%</li>
      </ul>
      <p class="panel-note">La cobertura por morfología no se midió en la ficha (valores en cero). El mapa de calor interpreta el semáforo como contaminación: menos líquenes → más contaminación.</p>
    `,
  },
  investigacion: {
    id: 'investigacion',
    title: 'Investigación',
    html: `
      <p class="panel-lead">Resumen del estudio: líquenes como bioindicador de calidad del aire en Chama.</p>
      <h3>Idea central</h3>
      <p>Los líquenes son sensibles a la contaminación. Donde hay más tráfico vehicular suele haber más contaminación y, por eso, <strong>menos líquenes</strong> en los árboles.</p>
      <h3>Qué se hizo</h3>
      <ul class="panel-list">
        <li>Se eligieron parques (menor tráfico esperado) y avenidas perimetrales (mayor tráfico).</li>
        <li>En cada sitio se contaron árboles examinados y árboles con presencia de líquenes.</li>
        <li>Se clasificó cada sitio con el semáforo de incidencia de la ficha técnica.</li>
      </ul>
      <h3>Hallazgos que se ven en el mapa</h3>
      <ul class="panel-list">
        <li><strong>Parques</strong> como La Coruña, Alcides Vigo o El Periodista llegan a incidencia Alta (cerca de 100%).</li>
        <li><strong>Avenidas</strong> de alto tráfico como Benavides y Aviación bajan a ~8% (Bajo): pocos líquenes, señal de mayor contaminación.</li>
        <li>Sitios intermedios (p. ej. Higuereta, Valle del Sur) quedan en Medio.</li>
      </ul>
      <h3>Cómo leer la app</h3>
      <p>Los pines muestran la <strong>incidencia de líquenes</strong>. El mapa de calor muestra la <strong>contaminación estimada</strong> (rojo = alto, verde = bajo), alineada con la narrativa del estudio.</p>
    `,
  },
  integrantes: {
    id: 'integrantes',
    title: 'Integrantes',
    html: `
      <p class="panel-lead">Asignatura: Ciencias — Colegio Particular Cristo Salvador, 6° B (Año PAI 2).</p>
      <h3>Docente</h3>
      <dl class="panel-dl">
        <div>
          <dt>Salazar Leiva Russell</dt>
          <dd>Especialidad: Ciencias<br/><a href="mailto:rsalazar@cristosalvador.edu.pe">rsalazar@cristosalvador.edu.pe</a></dd>
        </div>
      </dl>
      <h3>Integrantes</h3>
      <ul class="panel-list panel-people">
        <li>
          <strong>Culquicondor Torres Alessia Macarena</strong>
          <span class="person-mail"><a href="mailto:culquicondortorresalessia@cristosalvador.edu.pe">culquicondortorresalessia@cristosalvador.edu.pe</a></span>
        </li>
        <li>
          <strong>Reategui Arana Vania Xiomara</strong>
          <span class="person-mail"><a href="mailto:reateguiaranavania@cristosalvador.edu.pe">reateguiaranavania@cristosalvador.edu.pe</a></span>
        </li>
        <li>
          <strong>Melgarejo Estrada Alhied Illari</strong>
          <span class="person-mail"><a href="mailto:melgarejoestradaalhied@cristosalvador.edu.pe">melgarejoestradaalhied@cristosalvador.edu.pe</a></span>
        </li>
        <li>
          <strong>Galvez Vargas Mariano Francisco</strong>
          <span class="person-mail"><a href="mailto:galvezvargasmariano@cristosalvador.edu.pe">galvezvargasmariano@cristosalvador.edu.pe</a></span>
        </li>
        <li>
          <strong>Palpan Son Ethan Rodrigo</strong>
          <span class="person-mail"><a href="mailto:palpansonethan@cristosalvador.edu.pe">palpansonethan@cristosalvador.edu.pe</a></span>
        </li>
      </ul>
    `,
  },
};
