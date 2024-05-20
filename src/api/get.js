import http from "./http-common";

const getReq = async (url) => {
  try {
    const response = await http.get(url);
    return response.data;
  } catch (error) {
    return error;
  }
};

export default getReq;
