import axiosClient from "./axiosClient";

export async function getMyMedicalCard() {
    const res = await axiosClient.get('medical/medical-cards/my/');
    return res.data
}

export async function updateMyMedicalCard(id, data) {
    const res = await axiosClient.put(`medical/medical-cards/${id}/`, data);
    return res.data;
}

export async function getMedicalCardByPatient(patientId) {
    const res = await axiosClient.get(`medical/medical-cards/by-patient/${patientId}/`);
    return res.data;
}

export async function createMedicalRecord(data) {
    const res = await axiosClient.post('medical/medical-records/', data);
    return res.data;
}

export async function deleteMedicalRecord(recordId) {
    await axiosClient.delete(`medical/medical-records/${recordId}/`);
}

export async function updateMyMedicalRecord(recordId, data) {
    const res = await axiosClient.patch(`medical/medical-records/${recordId}/`, data);
    return res.data;
}