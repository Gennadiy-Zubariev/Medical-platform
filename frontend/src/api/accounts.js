import axiosClient from "./axiosClient";


export async function registerPatient(payload) {
    const response = await axiosClient.post("accounts/register/patient/", payload);
    return response.data;
}


export async function registerDoctor(payload) {
    const response = await axiosClient.post("accounts/register/doctor/", payload);
    return response.data;
}

export async function loginUser({username, password}) {
    const response = await axiosClient.post("token/", {username, password});
    console.log("TOKEN RESPONSE:", response.data);
    return response.data;
}

export async function updateMyUser(data) {
    const response = await axiosClient.patch("accounts/users/me/", data);
}

export async function getMyProfile() {
    const response = await axiosClient.get("accounts/users/me/");
    return response.data;
}

export async function getMyPatientProfile() {
    const response = await axiosClient.get("accounts/patient-profiles/me/");
    return response.data;
}

export async function updateMyPatientProfile(data) {
    const response = await axiosClient.patch("accounts/patient-profiles/me/", data);
    return response.data;
}

export async function getMyDoctorProfile() {
    const response = await axiosClient.get("accounts/doctor-profiles/me/");
    return response.data;
}

export async function updateMyDoctorProfile(data) {
    const response = await axiosClient.patch("accounts/doctor-profiles/me/", data);
    return response.data;
}

// export async function getDoctors() {
//     const res = await axiosClient.get('accounts/doctor-profiles/');
//     return res.data;
// }


export async function toggleDoctorBooking() {
  const response = await axiosClient.post("accounts/doctor-profiles/toggle-booking/");
  return response.data;
}


// export async function getMyDoctorSchedule() {
//     const response = await axiosClient.get("accounts/doctor/schedule/");
//     return response.data
// }

export async function updateMyDoctorSchedule(data) {
    const response = await axiosClient.patch("accounts/doctor/schedule/", data);
    return response.data;
}