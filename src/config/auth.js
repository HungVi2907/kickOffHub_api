const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using fallback dev secret; please set JWT_SECRET in production.');
}

export { JWT_SECRET, JWT_EXPIRES_IN };
