"""
AnimeLog Backend - Flask Application Factory
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, 
         supports_credentials=True, 
         origins=["http://localhost:5173"],
         allow_headers=["Content-Type", "Authorization"],
         expose_headers=["Content-Type", "Authorization"]
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.anime import anime_bp
    from app.routes.reviews import reviews_bp
    from app.routes.comments import comments_bp
    from app.routes.watchlist import watchlist_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(anime_bp, url_prefix='/api/anime')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(watchlist_bp, url_prefix='/api/watchlist')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"[JWT] Token expired: {jwt_payload}")
        return {"error": "Token has expired", "code": "token_expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"[JWT] Invalid token: {error}")
        return {"error": "Invalid token", "code": "invalid_token"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"[JWT] Missing token: {error}")
        return {"error": "Authorization required", "code": "authorization_required"}, 401

    return app
