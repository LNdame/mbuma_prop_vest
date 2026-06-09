import express from 'express';
import cors from 'cors';
import { HEALTH_OK } from '@mbuma/shared';
import authRouter        from './routes/auth.js';
import investorsRouter   from './routes/investors.js';
import invitationsRouter from './routes/invitations.js';
import propertiesRouter from './routes/properties.js';
import imagesRouter     from './routes/images.js';
import statsRouter      from './routes/stats.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: HEALTH_OK });
});

app.use('/api/auth',       authRouter);
app.use('/api/stats',       statsRouter);
app.use('/api/properties',  propertiesRouter);
app.use('/api/properties/:propertyId/images', imagesRouter);
app.use('/api/investors',   investorsRouter);
app.use('/api/invitations', invitationsRouter);

const PORT = Number(process.env.PORT) || 4000;
const HOST = '0.0.0.0'; // bind all interfaces so Railway can reach the container
app.listen(PORT, HOST, () => {
  console.log(`Backend listening on ${HOST}:${PORT} (PORT env=${process.env.PORT ?? 'unset'})`);
});
