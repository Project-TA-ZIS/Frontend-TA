import api from './api';

export async function getAllPemasukanZIS() {
  const res = await api.get('/pemasukanZIS/get/getAllPemasukanZIS');
  return res.data;
}

export async function getAllPengeluaranZIS() {
  const res = await api.get('/pengeluaranZIS/get/getAllPengeluaranZIS');
  return res.data;
}
