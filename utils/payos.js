import PayOS from '@payos/node';
import { config } from 'dotenv';
config();
export const payOs = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);
