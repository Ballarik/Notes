import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function saveWorkspacePlugin() {
  return {
    name: 'save-workspace-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-workspace' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const dataPath = path.resolve(__dirname, 'project_data/workspace_data.json');
              fs.mkdirSync(path.dirname(dataPath), { recursive: true });
              fs.writeFileSync(dataPath, body, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Salvato su file del progetto!' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }
        if (req.url === '/api/load-workspace' && req.method === 'GET') {
          try {
            const dataPath = path.resolve(__dirname, 'project_data/workspace_data.json');
            if (fs.existsSync(dataPath)) {
              const content = fs.readFileSync(dataPath, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
              return;
            }
          } catch (err) {}
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'File non trovato' }));
          return;
        }
        next();
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), saveWorkspacePlugin()],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/project_data/**', '**/workspace_data.json']
    }
  }
})
