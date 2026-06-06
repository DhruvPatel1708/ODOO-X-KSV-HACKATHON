import api from '../api/axios';
import { USE_MOCK_DATA, unwrap } from './config';
import { mockStore } from './mockStore';

export const invoiceService = {
  async list() {
    if (USE_MOCK_DATA) return mockStore.listInvoices();
    return unwrap(await api.get('/api/invoices'));
  },
  async generate(poId) {
    if (USE_MOCK_DATA) return mockStore.generateInvoice(poId);
    return unwrap(await api.post(`/api/invoices/generate/${poId}`));
  },
  async sendEmail(invoiceId, emailData) {
    if (USE_MOCK_DATA) return mockStore.sendInvoiceEmail(invoiceId, emailData);
    return unwrap(await api.post(`/api/invoices/${invoiceId}/send-email`, emailData));
  },
  async downloadPdf(invoiceId) {
    if (USE_MOCK_DATA) return null;
    return api.get(`/api/invoices/${invoiceId}/download-pdf`, { responseType: 'blob' });
  },
};
