import express from 'express';
import cors from 'cors';
import { HEALTH_OK } from '@mbuma/shared';
import authRouter        from './routes/auth.js';
import investorsRouter   from './routes/investors.js';
import invitationsRouter from './routes/invitations.js';
import propertiesRouter from './routes/properties.js';
import pledgesRouter    from './routes/pledges.js';
import kycRouter        from './routes/kyc.js';
import imagesRouter     from './routes/images.js';
import statsRouter      from './routes/stats.js';
import distributionsRouter from './routes/distributions.js';
import agreementsRouter    from './routes/agreements.js';
import reportsRouter       from './routes/reports.js';
import dashboardRouter     from './routes/dashboard.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: HEALTH_OK });
});

// Friendly root page so opening the backend URL in a browser confirms it's up.
app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mbuma PropVest API</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
           font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
           background: #0d2b1f; color: #e8f0eb; }
    .card { text-align: center; padding: 40px 48px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
             color: #34d399; background: rgba(52,211,153,.12); border: 1px solid rgba(52,211,153,.3);
             padding: 6px 14px; border-radius: 99px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; }
    h1 { font-size: 24px; font-weight: 700; margin: 18px 0 6px; letter-spacing: -0.3px; }
    p { margin: 0; color: #9fb3a8; font-size: 14px; }
    .links { margin-top: 22px; display: flex; gap: 10px; justify-content: center; }
    a { font-size: 13px; color: #e8f0eb; text-decoration: none; border: 1px solid rgba(255,255,255,.18);
        padding: 7px 14px; border-radius: 8px; }
    a:hover { border-color: rgba(255,255,255,.4); }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge"><span class="dot"></span> Backend is up</span>
    <h1>Mbuma PropVest API</h1>
    <p>The API server is running and ready to accept requests.</p>
    <div class="links">
      <a href="/health">Health check</a>
      <a href="/api/properties">Properties API</a>
    </div>
  </div>
</body>
</html>`);
});

app.use('/api/auth',       authRouter);
app.use('/api/stats',       statsRouter);
app.use('/api/properties',  propertiesRouter);
app.use('/api/properties/:propertyId/images', imagesRouter);
app.use('/api/pledges',     pledgesRouter);
app.use('/api/kyc',         kycRouter);
app.use('/api/investors',   investorsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/distributions', distributionsRouter);
app.use('/api/agreements',    agreementsRouter);
app.use('/api/reports',       reportsRouter);
app.use('/api/dashboard',     dashboardRouter);

const PORT = Number(process.env.PORT) || 4000;
const HOST = '0.0.0.0'; // bind all interfaces so Railway can reach the container
app.listen(PORT, HOST, () => {
  console.log(`Backend listening on ${HOST}:${PORT} (PORT env=${process.env.PORT ?? 'unset'})`);
});
