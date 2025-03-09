# GIUMARKET

## Project Structure

```
GIUMARKET/
├── backend/              # Node.js & Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation middleware
│   ├── .env            # Environment variables
│   └── index.js        # Server entry point
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── utils/      # Utility functions
│   └── package.json
└── README.md
```

## Installation & Setup

### Backend

```bash
cd backend
npm i
npm run dev
```

### Frontend

```bash
cd frontend
npm i
npm run dev
```

## .env variables!!!

```
MONGODB_URI= the uri youssef sent
JWT_SECRET=8bf8a6f419e7bedb70e273d2ae2ef8111402113c0d52598d25af974710024e56493cfc44f2114b36fb15e6de9d03555dfe8262626d3d877c7cd91b4f6973982e
PORT=8080
```

## Development Workflow

1. Create a new branch from main:

```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git add .
git commit -m "describe your changes"
git push origin feature/your-feature-name
```

3. Create a Pull Request:

- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Merge into "STAGING" branch!!!!
- Add @moustafashady as reviewer
- Describe your changes in detail

4. Wait for review and merge approval

## Important Notes

- Never push directly to main branch
- Keep PRs focused and small
- Write meaningful commit messages
- Test your changes before submitting PR
