import {
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import type { VncSettings } from '../../constants/vncDefaults';
import { VNC_DEFAULTS, CLIPBOARD_ENCODINGS } from '../../constants/vncDefaults';

function OverrideCheckbox({ label, mode, isOverridden, onToggle }: {
  label: string;
  mode: 'global' | 'connection';
  isOverridden: boolean;
  onToggle: () => void;
}) {
  if (mode !== 'connection') return null;
  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={isOverridden} onChange={onToggle} />}
      label={<Typography variant="caption">Override {label}</Typography>}
      sx={{ mb: 0.5 }}
    />
  );
}

interface VncSettingsSectionProps {
  value: Partial<VncSettings>;
  onChange: (updated: Partial<VncSettings>) => void;
  mode: 'global' | 'connection';
  resolvedDefaults: VncSettings;
}

export default function VncSettingsSection({ value, onChange, mode, resolvedDefaults }: VncSettingsSectionProps) {
  const effective = { ...resolvedDefaults, ...value };

  const set = (key: keyof VncSettings, val: unknown) => {
    onChange({ ...value, [key]: val });
  };

  const clearKey = (key: keyof VncSettings) => {
    const { [key]: _, ...rest } = value;
    onChange(rest);
  };

  const isConn = mode === 'connection';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Color Depth */}
      <Box>
        <OverrideCheckbox label="Color depth" mode={mode} isOverridden={'colorDepth' in value} onToggle={() => 'colorDepth' in value ? clearKey('colorDepth') : set('colorDepth', 24)} />
        <FormControl fullWidth size="small" disabled={isConn && !('colorDepth' in value)}>
          <InputLabel>Color Depth</InputLabel>
          <Select value={effective.colorDepth ?? ''} label="Color Depth" onChange={(e) => set('colorDepth', e.target.value || undefined)}>
            <MenuItem value="">Auto</MenuItem>
            <MenuItem value={8}>8-bit (256 colors)</MenuItem>
            <MenuItem value={16}>16-bit (High Color)</MenuItem>
            <MenuItem value={24}>24-bit (True Color)</MenuItem>
            <MenuItem value={32}>32-bit (True Color + Alpha)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Cursor Mode */}
      <Box>
        <OverrideCheckbox label="Cursor mode" mode={mode} isOverridden={'cursor' in value} onToggle={() => 'cursor' in value ? clearKey('cursor') : set('cursor', VNC_DEFAULTS.cursor)} />
        <FormControl fullWidth size="small" disabled={isConn && !('cursor' in value)}>
          <InputLabel>Cursor Mode</InputLabel>
          <Select value={effective.cursor ?? 'local'} label="Cursor Mode" onChange={(e) => set('cursor', e.target.value)}>
            <MenuItem value="local">Local (rendered by browser)</MenuItem>
            <MenuItem value="remote">Remote (rendered by server)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Clipboard Encoding */}
      <Box>
        <OverrideCheckbox label="Clipboard encoding" mode={mode} isOverridden={'clipboardEncoding' in value} onToggle={() => 'clipboardEncoding' in value ? clearKey('clipboardEncoding') : set('clipboardEncoding', VNC_DEFAULTS.clipboardEncoding)} />
        <FormControl fullWidth size="small" disabled={isConn && !('clipboardEncoding' in value)}>
          <InputLabel>Clipboard Encoding</InputLabel>
          <Select value={effective.clipboardEncoding ?? 'UTF-8'} label="Clipboard Encoding" onChange={(e) => set('clipboardEncoding', e.target.value)}>
            {CLIPBOARD_ENCODINGS.map((enc) => (
              <MenuItem key={enc.value} value={enc.value}>{enc.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Toggles */}
      <Box>
        <OverrideCheckbox label="Read-only" mode={mode} isOverridden={'readOnly' in value} onToggle={() => 'readOnly' in value ? clearKey('readOnly') : set('readOnly', VNC_DEFAULTS.readOnly)} />
        <FormControlLabel
          control={<Switch checked={effective.readOnly ?? false} onChange={(e) => set('readOnly', e.target.checked)} disabled={isConn && !('readOnly' in value)} />}
          label="Read-only (view only, no input)"
        />
      </Box>

      <Box>
        <OverrideCheckbox label="Swap red/blue" mode={mode} isOverridden={'swapRedBlue' in value} onToggle={() => 'swapRedBlue' in value ? clearKey('swapRedBlue') : set('swapRedBlue', VNC_DEFAULTS.swapRedBlue)} />
        <FormControlLabel
          control={<Switch checked={effective.swapRedBlue ?? false} onChange={(e) => set('swapRedBlue', e.target.checked)} disabled={isConn && !('swapRedBlue' in value)} />}
          label="Swap red/blue channels"
        />
      </Box>

      <Box>
        <OverrideCheckbox label="Disable audio" mode={mode} isOverridden={'disableAudio' in value} onToggle={() => 'disableAudio' in value ? clearKey('disableAudio') : set('disableAudio', VNC_DEFAULTS.disableAudio)} />
        <FormControlLabel
          control={<Switch checked={effective.disableAudio ?? true} onChange={(e) => set('disableAudio', e.target.checked)} disabled={isConn && !('disableAudio' in value)} />}
          label="Disable audio"
        />
      </Box>
    </Box>
  );
}
