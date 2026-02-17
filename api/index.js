import app from '../backend/src/app.js';
import { connectMongo } from '../backend/src/config/db.js';

export default async function handler(req, res) {
  // Ensure DB connection is established
  await connectMongo();
  // Pass request to Express app
  return app(req, res);
}
