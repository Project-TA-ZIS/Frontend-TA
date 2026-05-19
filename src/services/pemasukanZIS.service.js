import api from './api';

 async function getAllPemasukanZIS() {
  const res = await api.get('/pemasukanZIS/get/getAllPemasukanZIS');
  return res.data;
}


export default {
  getAllPemasukanZIS,
};
