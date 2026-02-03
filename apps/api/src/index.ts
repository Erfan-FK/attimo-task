// Load environment variables FIRST before any other imports
import './config/env';

// Now import app after env vars are loaded
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}/api-docs`);
});
