import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { testConnection } from './config/database';

// Charger les variables d'environnement
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Spotilike fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api', routes);

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Démarrer le serveur
const startServer = async () => {
  // Tester la connexion MySQL
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.warn('⚠️  La connexion MySQL a échoué. L\'API démarre quand même...');
  }

  app.listen(PORT, () => {
    console.log();
  });
};

startServer();
