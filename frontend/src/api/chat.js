import axiosClient from "./axiosClient";

export async function getChatRoom(appointmentId) {
    const res = await axiosClient.get(`chat/rooms/${appointmentId}/`);
    return res.data;
}

export async function sendChatMessage(appointmentId, text) {
    const res = await axiosClient.post(`chat/rooms/${appointmentId}/messages/`, {text});
    return res.data;

}