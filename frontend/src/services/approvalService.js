import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const approvalService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listApprovals();
    return unwrap(await api.get('/api/approvals'));
  },
  async create(data) {
    if (USE_MOCK_DATA) return mockStore.createApproval(data);
    return unwrap(await api.post('/api/approvals', data));
  },
  async approve(id, remarks = 'Approved') {
    if (USE_MOCK_DATA) return mockStore.approve(id, remarks);
    return unwrap(await api.put(`/api/approvals/${id}/approve`, { remarks }));
  },
  async reject(id, remarks) {
    if (USE_MOCK_DATA) return mockStore.reject(id, remarks);
    return unwrap(await api.put(`/api/approvals/${id}/reject`, { remarks }));
  },
};
