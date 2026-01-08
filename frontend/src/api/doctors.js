import axiosClient from "./axiosClient";

export const getDoctorSpecializations = () =>
    axiosClient.get('/accounts/doctors/specializations').then(res => res.data);

export const getDoctorsPublic = (params) =>
    axiosClient.get("/accounts/doctors/", {params}).then(res => res.data.results);

export const getDoctorPublicById = (id) =>
    axiosClient.get(`/accounts/doctors/${id}/`).then(res => res.data);

