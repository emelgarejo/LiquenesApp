import { readEnv, MissingMapsKeyError } from './config/env';
import { loadDataset } from './data/loadDataset';
import { validateDataset } from './data/validateDataset';
import { toSiteViews } from './domain/derive';
import { DEFAULT_THRESHOLDS } from './config/thresholds';
import { bootstrapMap } from './map/bootstrap';
import { renderLegend } from './ui/legend';
import { renderProvisionalNotice } from './ui/provisionalNotice';
import { renderLayerToggle } from './ui/layerToggle';
import { hideStatus, showStatus } from './ui/statusView';
import { statusFromValidation } from './boot/statusFromValidation';

async function boot(): Promise<void> {
  const mapEl = mustEl('map');
  const statusEl = mustEl('status');
  const legendEl = mustEl('legend');
  const noticeEl = mustEl('provisional-notice');
  const toggleEl = mustEl('layer-toggle');

  let env;
  try {
    env = readEnv();
  } catch (error) {
    const message =
      error instanceof MissingMapsKeyError
        ? error.message
        : 'Configuration error while reading environment.';
    showStatus(
      statusEl,
      'config',
      'Maps API key missing',
      message,
    );
    return;
  }

  let loaded;
  try {
    loaded = await loadDataset();
  } catch (error) {
    showStatus(
      statusEl,
      'data',
      'Failed to load study data',
      error instanceof Error ? error.message : 'Unknown data load error',
    );
    return;
  }

  const validated = validateDataset(loaded.study);
  const bootStatus = statusFromValidation(validated);
  if (bootStatus) {
    showStatus(statusEl, bootStatus.kind, bootStatus.title, bootStatus.message);
    return;
  }

  const { views, warnings } = toSiteViews(
    validated.usableSites,
    DEFAULT_THRESHOLDS,
  );
  if (warnings.length > 0) {
    console.warn(warnings.join('\n'));
  }

  hideStatus(statusEl);
  renderProvisionalNotice(noticeEl, validated.study!.status || 'provisional');
  renderLegend(legendEl, { heatEnabled: false });

  const handle = await bootstrapMap(
    mapEl,
    env.googleMapsApiKey,
    loaded.boundary,
    views,
  );

  renderLayerToggle(toggleEl, async (enabled) => {
    await handle.setHeatEnabled(enabled);
    renderLegend(legendEl, { heatEnabled: enabled });
  });
}

function mustEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing #${id} element`);
  }
  return el;
}

void boot().catch((error) => {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    showStatus(
      statusEl,
      'error',
      'Unexpected error',
      error instanceof Error ? error.message : String(error),
    );
  }
  console.error(error);
});
