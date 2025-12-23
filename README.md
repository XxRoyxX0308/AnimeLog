# 🎌 AnimeLog

A modern anime tracking and community platform where users can discover anime, track their watchlist, and share reviews with the community.

![AnimeLog](https://img.shields.io/badge/AnimeLog-v1.0.0-FF6B9D?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- **🔍 Anime Catalog** - Browse and search thousands of anime titles with advanced filters
- **📋 Watchlist Management** - Track anime by status: Watching, Completed, On Hold, Dropped, Plan to Watch
- **⭐ Reviews & Ratings** - Write and share detailed reviews with the community
- **💬 Comments** - Engage with other users through review comments
- **👤 User Profiles** - View user stats, reviews, and activity
- **🌙 Dark Mode** - Beautiful anime-themed dark interface
- **📱 Responsive** - Fully responsive design for all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling with custom anime theme
- **Axios** - HTTP client with interceptors
- **Heroicons** - Beautiful hand-crafted icons
- **Vite** - Next-generation frontend tooling

### Backend
- **Flask 3** - Python web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Bcrypt** - Password hashing
- **PostgreSQL** - Relational database
- **Flask-CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
AnimeLog/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models.py            # Database models
│   │   └── routes/
│   │       ├── anime.py         # Anime endpoints
│   │       ├── auth.py          # Authentication
│   │       ├── comments.py      # Comments CRUD
│   │       ├── reviews.py       # Reviews CRUD
│   │       ├── users.py         # User profiles
│   │       └── watchlist.py     # Watchlist management
│   ├── config.py                # Configuration
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── anime/           # Anime components
│   │   │   ├── auth/            # Auth guards
│   │   │   ├── layout/          # Layout components
│   │   │   ├── reviews/         # Review components
│   │   │   ├── ui/              # Reusable UI
│   │   │   └── watchlist/       # Watchlist modals
│   │   ├── lib/
│   │   │   └── api.js           # API client
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand stores
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 15+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   DATABASE_URL=postgresql://postgres:password@localhost:5432/animelog
   ```

5. **Initialize database**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Run the server**
   ```bash
   python run.py
   ```
   Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev -- --host
   ```
   Frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Anime
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/anime` | Get anime list (paginated) |
| GET | `/api/anime/:id` | Get anime details |
| GET | `/api/anime/genres` | Get all genres |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get community reviews |
| GET | `/api/reviews/:id` | Get review details |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | Get user's watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| PUT | `/api/watchlist/:id` | Update watchlist entry |
| DELETE | `/api/watchlist/:id` | Remove from watchlist |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/:id/comments` | Get review comments |
| POST | `/api/comments` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |

## 🎨 Theme Customization

The app uses a custom anime-inspired color palette defined in `tailwind.config.js`:

```javascript
colors: {
  'anime-primary': '#FF6B9D',    // Sakura pink
  'anime-secondary': '#9D4EDD',  // Purple
  'anime-accent': '#00D4FF',     // Cyan
  'anime-dark': {
    900: '#0D0D0F',              // Background
    800: '#151518',              // Card background
    700: '#1E1E24',              // Elevated
    600: '#2A2A33',              // Border
  }
}
```

## 🔐 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `JWT_SECRET_KEY` | JWT signing key | `jwt-secret-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost/animelog` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📜 Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
python run.py              # Run development server
flask db migrate           # Create migration
flask db upgrade           # Apply migrations
gunicorn run:app           # Run production server
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Anime data inspiration from MyAnimeList and AniList
- Icons by [Heroicons](https://heroicons.com/)
- UI inspiration from modern streaming platforms

---

<p align="center">
  Made with ❤️ by the AnimeLog Team
</p>
