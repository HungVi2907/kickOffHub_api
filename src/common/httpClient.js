import axios from 'axios';

const defaultTimeout = Number(process.env.HTTP_CLIENT_TIMEOUT || 10000);

export function createHttpClient(config = {}) {
  return axios.create({
    timeout: defaultTimeout,
    ...config,
  });
}

export const httpClient = createHttpClient();
export default httpClient;
