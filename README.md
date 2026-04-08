# Frontend Development Guide

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx               # Main App component
│   ├── App.css              # App styles
│   ├── main.jsx             # Entry point
│   ├── Api.js               # Axios configuration
│   ├── internshipService.js # API service layer
│   ├── Lib.js               # Utilities
│   └── components/          # React components
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
├── Dockerfile              # Docker configuration
└── README.md              # This file
```

## Prerequisites

- **Node.js** (v16+)
- **npm** (v8+)

Verify installations:
```bash
node --version
npm --version
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

Edit `src/Api.js` to point to your backend:
```javascript
const API = axios.create({
  baseURL: "http://localhost:8080/api",
});
```

Or create `.env.local`:
```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server (with HMR) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## API Integration

### Using the API Service

The `Api.js` file exports a configured Axios instance:

```javascript
import API from './Api.js';

// GET request
API.get('/v1/internships')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// POST request
API.post('/v1/internships', {
  title: 'Java Developer',
  company: 'TechCorp',
  location: 'New York, NY'
})
  .then(response => console.log('Created:', response.data))
  .catch(error => console.error(error));
```

### Environment Variables

Create `.env.local` file (not committed to git):

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Other configurations
VITE_APP_NAME=EasyIntern
VITE_APP_VERSION=1.0.0
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Component Development

### Creating a New Component

1. Create component file:
```javascript
// src/components/InternshipCard.jsx
export default function InternshipCard({ internship }) {
  return (
    <div className="card">
      <h2>{internship.title}</h2>
      <p>{internship.company}</p>
      <p>{internship.location}</p>
    </div>
  );
}
```

2. Use in parent component:
```javascript
import InternshipCard from './components/InternshipCard';

function App() {
  return (
    <div>
      <InternshipCard internship={{...}} />
    </div>
  );
}
```

## State Management

### Using React Hooks

```javascript
import { useState, useEffect } from 'react';
import API from './Api';

function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/v1/internships')
      .then(res => {
        setInternships(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {internships.map(internship => (
        <InternshipCard key={internship.id} internship={internship} />
      ))}
    </div>
  );
}
```

## Styling

### CSS Modules (Optional)

Create `App.module.css`:
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
```

Use in component:
```javascript
import styles from './App.module.css';

export default function App() {
  return <div className={styles.container}>...</div>;
}
```

### Tailwind CSS (Optional Setup)

Install:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in `dist/` folder.

### Preview Built Version

```bash
npm run preview
```

### Deployment Options

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

#### Docker
```bash
docker build -t easyintern-frontend .
docker run -p 3000:3000 easyintern-frontend
```

## Code Quality

### Running ESLint

```bash
npm run lint
```

### Fix Linting Issues

```bash
npm run lint -- --fix
```

## Troubleshooting

### Port 5173 Already in Use

Change port in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### API Requests Blocked (CORS Error)

Ensure:
1. Backend CORS is configured correctly
2. Frontend API base URL matches backend URL
3. Backend is running on http://localhost:8080

### Hot Module Replacement (HMR) Not Working

Update `vite.config.js`:
```javascript
server: {
  hmr: {
    host: 'localhost',
    port: 5173
  }
}
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [ESLint Documentation](https://eslint.org)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

For more help, check the main [README.md](../README.md)
