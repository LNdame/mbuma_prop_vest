import express from 'express';
import cors from 'cors';
import { HEALTH_OK } from '@mbuma/shared';
import authRouter        from './routes/auth.js';
import investorsRouter   from './routes/investors.js';
import invitationsRouter from './routes/invitations.js';
import propertiesRouter from './routes/properties.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: HEALTH_OK });
});

app.use('/api/auth',       authRouter);
app.use('/api/properties',  propertiesRouter);
app.use('/api/investors',   investorsRouter);
app.use('/api/invitations', invitationsRouter);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
