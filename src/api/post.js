import http from "./http-common";

const postReq = async (url, data) => {
  const response = await http.post(url, data);

  if (response?.name === "AxiosError") throw new Error(response);

  return response.data;
};

export default postReq;
