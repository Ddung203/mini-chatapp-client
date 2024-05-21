import http from "./http-common";

const getReq = async (url) => {
  const response = await http.get(url);
  if (response?.name === "AxiosError") throw new Error(response);

  return response.data;
};

export default getReq;
