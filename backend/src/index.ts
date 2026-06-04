import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  type ApiResponse,
  type CreatePropertyInput,
  type Property,
  HEALTH_OK,
} from '@mbuma/shared';
import authRouter from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// In-memory store (replace with a real DB later).
const properties: Property[] = [];

app.get('/health', (_req, res) => {
  res.json({ status: HEALTH_OK });
});

app.get('/api/properties', (_req, res) => {
  const body: ApiResponse<Property[]> = { data: properties };
  res.json(body);
});

app.post('/api/properties', (req, res) => {
  const input = req.body as CreatePropertyInput;
  const property: Property = {
    id: crypto.randomUUID(),
    ...input,
    status: 'available',
    createdAt: new Date().toISOString(),
  };
  properties.push(property);
  const body: ApiResponse<Property> = { data: property };
  res.status(201).json(body);
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
