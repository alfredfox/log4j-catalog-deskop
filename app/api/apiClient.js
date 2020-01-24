import axios from 'axios';
import qs from 'qs';

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': '',
    'X-CSRF-Token': localStorage.getItem('xCsrfTokenValue') || null,
    common: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache', // eslint-disable-line,
    },
  },
  paramsSerializer: params => qs.stringify(params, { indices: false }),
});

// ================================================================================

// export const {
//   CancelToken,
//   isCancel
// } = axios;
//
// export const registerReqResInterceptors = (errorAction) => {
//   client.interceptors.request.use((response) => response, (error) => {
//     errorAction(error);
//     throw error;
//   });
//
//   client.interceptors.response.use((response) => response, (error) => {
//     errorAction(error);
//     throw error;
//   });
// };

export const registerResInterceptors = (cb, errorCb) => {
  apiClient.interceptors.response.use(cb, errorCb);
};
