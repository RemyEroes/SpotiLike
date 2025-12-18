import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool de connexions MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SPOTILIKE',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de connexion
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL réussie!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error);
    return false;
  }
};

export default pool;
