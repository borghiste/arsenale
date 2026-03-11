import api from './client';

export type VaultFolderScope = 'PERSONAL' | 'TEAM' | 'TENANT';

export interface VaultFolderInput {
  name: string;
  scope: VaultFolderScope;
  parentId?: string;
  teamId?: string;
}

export interface VaultFolderUpdate {
  name?: string;
  parentId?: string | null;
}

export interface VaultFolderData {
  id: string;
  name: string;
  parentId: string | null;
  scope: VaultFolderScope;
  sortOrder: number;
  userId: string;
  teamId: string | null;
  tenantId: string | null;
  teamName?: string | null;
}

export interface VaultFoldersResponse {
  personal: VaultFolderData[];
  team: VaultFolderData[];
  tenant: VaultFolderData[];
}

export async function listVaultFolders(): Promise<VaultFoldersResponse> {
  const res = await api.get('/vault-folders');
  return res.data;
}

export async function createVaultFolder(data: VaultFolderInput): Promise<VaultFolderData> {
  const res = await api.post('/vault-folders', data);
  return res.data;
}

export async function updateVaultFolder(
  id: string,
  data: VaultFolderUpdate
): Promise<VaultFolderData> {
  const res = await api.put(`/vault-folders/${id}`, data);
  return res.data;
}

export async function deleteVaultFolder(id: string): Promise<{ deleted: boolean }> {
  const res = await api.delete(`/vault-folders/${id}`);
  return res.data;
}
