import { fetchApi } from './apiConfig.js';

// Organization accounts: master admin manages org admins, org admins manage their staff
export const getAccounts = async () => (await fetchApi('/accounts')).accounts;
export const createAccount = (account) => fetchApi('/accounts', { method: 'POST', body: JSON.stringify(account) });
export const updateAccount = (id, changes) => fetchApi(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
export const deleteAccount = (id) => fetchApi(`/accounts/${id}`, { method: 'DELETE' });
