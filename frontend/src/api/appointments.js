import axiosClient from './axiosClient';

export async function getMyAppointments() {
    const res = await axiosClient.get('appointments/');
    return res.data;
}

export async function createAppointment(data) {
    const res = await axiosClient.post('appointments/', data);
    return res.data;
}

export async function cancelAppointment(id) {
    const res = await axiosClient.delete(`appointments/${id}/cancel/`);
}

export async function setAppointmentStatus(id, status) {
    const res = await axiosClient.post(`appointments/${id}/set-status/`, {status});
    return res.data;
}



export async function getAvailableSlots(doctorId, date) {
  const res = await axiosClient.get(
    `appointments/available-slots/?doctor=${doctorId}&date=${date}`
  );
  return res.data;
}
