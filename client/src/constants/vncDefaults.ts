export interface VncSettings {
  colorDepth?: 8 | 16 | 24 | 32;
  cursor?: 'local' | 'remote';
  readOnly?: boolean;
  clipboardEncoding?: 'ISO8859-1' | 'UTF-8' | 'UTF-16' | 'CP1252';
  swapRedBlue?: boolean;
  disableAudio?: boolean;
}

export const VNC_DEFAULTS: Required<Omit<VncSettings, 'colorDepth'>> = {
  cursor: 'local',
  readOnly: false,
  clipboardEncoding: 'UTF-8',
  swapRedBlue: false,
  disableAudio: true,
};

export const CLIPBOARD_ENCODINGS = [
  { label: 'ISO 8859-1 (Latin-1)', value: 'ISO8859-1' },
  { label: 'UTF-8', value: 'UTF-8' },
  { label: 'UTF-16', value: 'UTF-16' },
  { label: 'CP1252 (Windows)', value: 'CP1252' },
] as const;

export function mergeVncConfig(
  connectionOverrides?: Partial<VncSettings> | null,
): VncSettings {
  const merged: VncSettings = { ...VNC_DEFAULTS };

  if (connectionOverrides) {
    for (const [k, v] of Object.entries(connectionOverrides)) {
      if (v !== undefined) (merged as Record<string, unknown>)[k] = v;
    }
  }

  return merged;
}
