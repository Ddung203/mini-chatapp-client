import http from "./http-common";

const postReq = async (url, data) => {
  try {
    const response = await http.post(url, data);

    return response.data;
  } catch (error) {
    // console.log("error :>> ", error);
    return error?.response;
  }
};

export default postReq;
