import React from 'react';
import type { Account } from '../types';
import { KeychainPage } from './pages/KeychainPage';

interface TabPanelProps {
  tab: 'keychain' | 'connections';
  account: Account | null;
}

export function TabPanel({ tab, account }: TabPanelProps): React.ReactElement {
  if (!account) {
    return (
      <div className="tab-panel">
        <p className="tab-placeholder">Select an account to continue.</p>
      </div>
    );
  }

  if (tab === 'keychain') {
    return (
      <div className="tab-panel">
        <KeychainPage account={account} />
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div className="tab-placeholder-section">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <h3>Connections</h3>
        <p>
          View and launch SSH/RDP connections from your Arsenale server.
        </p>
        <span className="coming-soon">Coming soon</span>
      </div>
    </div>
  );
}
