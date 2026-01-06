"""
Database Models for AnimeLog
"""
from datetime import datetime
from app import db


class User(db.Model):
    """User model with authentication and profile info"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    avatar_url = db.Column(db.String(500), default='')
    bio = db.Column(db.Text, default='')
    
    # Role-based access control (user, admin, editor, moderator, etc.)
    role = db.Column(db.String(20), default='user', nullable=False, index=True)
    
    # OAuth fields
    oauth_provider = db.Column(db.String(50), nullable=True)
    oauth_id = db.Column(db.String(255), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    watchlist = db.relationship('WatchList', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_email=False):
        data = {
            'id': self.id,
            'username': self.username,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'stats': {
                'reviews_count': self.reviews.count(),
                'comments_count': self.comments.count(),
                'watchlist_count': self.watchlist.count()
            }
        }
        if include_email:
            data['email'] = self.email
        return data
    
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'admin'
    
    def __repr__(self):
        return f'<User {self.username}>'


class Anime(db.Model):
    """Anime model with detailed information"""
    __tablename__ = 'anime'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    title_japanese = db.Column(db.String(255), nullable=True)
    synopsis = db.Column(db.Text, default='')
    cover_image = db.Column(db.String(500), default='')
    banner_image = db.Column(db.String(500), default='')
    
    # Anime details
    type = db.Column(db.String(50), default='TV')  # TV, Movie, OVA, ONA, Special
    episodes = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='Ongoing')  # Ongoing, Completed, Upcoming
    aired_from = db.Column(db.Date, nullable=True)
    aired_to = db.Column(db.Date, nullable=True)
    season = db.Column(db.String(50), nullable=True)  # Spring 2024, etc.
    
    # Ratings
    average_rating = db.Column(db.Float, default=0.0)
    rating_count = db.Column(db.Integer, default=0)
    
    # Genres (stored as comma-separated for simplicity)
    genres = db.Column(db.String(500), default='')
    studios = db.Column(db.String(500), default='')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='anime', lazy='dynamic', cascade='all, delete-orphan')
    watchlist_entries = db.relationship('WatchList', backref='anime', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_reviews=False):
        data = {
            'id': self.id,
            'title': self.title,
            'title_japanese': self.title_japanese,
            'synopsis': self.synopsis,
            'cover_image': self.cover_image,
            'banner_image': self.banner_image,
            'type': self.type,
            'episodes': self.episodes,
            'status': self.status,
            'aired_from': self.aired_from.isoformat() if self.aired_from else None,
            'aired_to': self.aired_to.isoformat() if self.aired_to else None,
            'season': self.season,
            'average_rating': round(self.average_rating, 1),
            'rating_count': self.rating_count,
            'genres': self.genres.split(',') if self.genres else [],
            'studios': self.studios.split(',') if self.studios else [],
            'created_at': self.created_at.isoformat()
        }
        if include_reviews:
            data['reviews'] = [r.to_dict() for r in self.reviews.limit(5).all()]
        return data
    
    def update_rating(self):
        """Recalculate average rating from reviews"""
        reviews = self.reviews.all()
        if reviews:
            total = sum(r.rating for r in reviews)
            self.average_rating = total / len(reviews)
            self.rating_count = len(reviews)
        else:
            self.average_rating = 0.0
            self.rating_count = 0
    
    def __repr__(self):
        return f'<Anime {self.title}>'


class Review(db.Model):
    """Review model for anime reviews"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    anime_id = db.Column(db.Integer, db.ForeignKey('anime.id'), nullable=False, index=True)
    
    rating = db.Column(db.Integer, nullable=False)  # 1-10
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # Review stats
    likes_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    comments = db.relationship('Comment', backref='review', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_anime=False, include_comments=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'anime_id': self.anime_id,
            'rating': self.rating,
            'title': self.title,
            'content': self.content,
            'likes_count': self.likes_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'author': self.author.to_dict() if self.author else None
        }
        if include_anime:
            data['anime'] = {
                'id': self.anime.id,
                'title': self.anime.title,
                'cover_image': self.anime.cover_image
            }
        if include_comments:
            data['comments'] = [c.to_dict() for c in self.comments.order_by(Comment.created_at.desc()).limit(10).all()]
            data['comments_count'] = self.comments.count()
        return data
    
    def __repr__(self):
        return f'<Review {self.id} by User {self.user_id}>'


class Comment(db.Model):
    """Comment model for review comments"""
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id'), nullable=False, index=True)
    
    content = db.Column(db.Text, nullable=False)
    likes_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        user_data = self.author.to_dict() if self.author else None
        return {
            'id': self.id,
            'user_id': self.user_id,
            'review_id': self.review_id,
            'content': self.content,
            'likes_count': self.likes_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'author': user_data,
            'user': user_data  # Add user key for frontend compatibility
        }
    
    def __repr__(self):
        return f'<Comment {self.id}>'


class WatchList(db.Model):
    """WatchList/Logs model for tracking anime"""
    __tablename__ = 'watchlist'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    anime_id = db.Column(db.Integer, db.ForeignKey('anime.id'), nullable=False, index=True)
    
    status = db.Column(db.String(50), default='plan_to_watch')  # watching, completed, on_hold, dropped, plan_to_watch
    progress = db.Column(db.Integer, default=0)  # Episodes watched
    score = db.Column(db.Integer, nullable=True)  # Personal score 1-10
    notes = db.Column(db.Text, default='')
    
    # Timestamps
    started_at = db.Column(db.Date, nullable=True)
    completed_at = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint: one entry per user per anime
    __table_args__ = (db.UniqueConstraint('user_id', 'anime_id', name='unique_user_anime_watchlist'),)
    
    def to_dict(self, include_anime=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'anime_id': self.anime_id,
            'status': self.status,
            'progress': self.progress,
            'score': self.score,
            'notes': self.notes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_anime and self.anime:
            data['anime'] = {
                'id': self.anime.id,
                'title': self.anime.title,
                'cover_image': self.anime.cover_image,
                'episodes': self.anime.episodes,
                'status': self.anime.status
            }
        return data
    
    def __repr__(self):
        return f'<WatchList {self.id} - User {self.user_id} - Anime {self.anime_id}>'
