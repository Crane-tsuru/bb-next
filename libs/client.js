import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: 'bb-next',
  apiKey: process.env.API_KEY,
});