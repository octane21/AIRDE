const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const riskRoutes = require('./routes/risks');
const actionRoutes = require('./routes/actions');
const userRoutes = require('./routes/users');
const criticalityRoutes = require('./routes/criticality');
const inspectionRoutes = require('./routes/inspections');
const dftRoutes = require('./routes/dft');
const utRoutes = require('./routes/ut');
const visualRoutes = require('./routes/visual');
const photoRoutes = require('./routes/photos');
const findingRoutes = require('./routes/findings');
const maintenancePlanRoutes = require('./routes/maintenancePlan');
const workOrderRoutes = require('./routes/workOrders');
const maintenanceStrategyRoutes = require('./routes/maintenanceStrategy');
const teamRoutes = require('./routes/teams');
const configRoutes = require('./routes/config');
const engineRoutes = require('./routes/engine');
const statsRoutes = require('./routes/stats');
const hierarchyRoutes = require('./routes/hierarchy');
const trendRoutes = require('./routes/trend');
const reportRoutes = require('./routes/report');
const lookupRoutes = require('./routes/lookup');
const formulaMapRoutes = require('./routes/formulaMap');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS_ORIGIN: comma-separated list of allowed frontend origins for production
// (e.g. "https://airde.vercel.app,https://airde-staging.vercel.app").
// Falls back to the local Vite dev/preview ports when unset.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/criticality', criticalityRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/dft', dftRoutes);
app.use('/api/ut', utRoutes);
app.use('/api/visual', visualRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/maintenance-plan', maintenancePlanRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/maintenance-strategy', maintenanceStrategyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/config', configRoutes);
app.use('/api/engine', engineRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/trend', trendRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/api/formula-map', formulaMapRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0'() => {
  console.log(`AIRDE backend running on ${PORT}`);
});
