import api from './api';

export async function getAllMustahik() {
  const res = await api.get('/mustahik/get/getAllMustahik');
  return res.data;
}

export async function createMustahik(payload) {
  const res = await api.post('/mustahik/post/createMustahik', payload);
  return res.data;
}

export async function updateMustahik(id, payload) {
  const res = await api.put(`/mustahik/put/editMustahik/${id}`, payload);
  return res.data;
}

export async function deleteMustahik(id) {
  const res = await api.delete(`/mustahik/delete/deleteMustahik/${id}`);
  return res.data;
}
