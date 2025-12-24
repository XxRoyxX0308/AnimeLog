"""
Users Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Review, WatchList

users_bp = Blueprint('users', __name__)


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get public user profile (Public)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/<int:user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    """Get user's reviews (Public)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    query = Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'reviews': [r.to_dict(include_anime=True) for r in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@users_bp.route('/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics (Public)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Watchlist stats
    watchlist_entries = WatchList.query.filter_by(user_id=user_id).all()
    
    # Get all user reviews for average rating calculation
    user_reviews = Review.query.filter_by(user_id=user_id).all()
    
    # Calculate average rating from reviews
    if user_reviews:
        avg_rating = sum(r.rating for r in user_reviews) / len(user_reviews)
    else:
        avg_rating = 0.0
    
    stats = {
        'total_anime': len(watchlist_entries),
        'anime_count': len(watchlist_entries),
        'watching': sum(1 for e in watchlist_entries if e.status == 'watching'),
        'completed': sum(1 for e in watchlist_entries if e.status == 'completed'),
        'on_hold': sum(1 for e in watchlist_entries if e.status == 'on_hold'),
        'dropped': sum(1 for e in watchlist_entries if e.status == 'dropped'),
        'plan_to_watch': sum(1 for e in watchlist_entries if e.status == 'plan_to_watch'),
        'total_episodes': sum(e.progress for e in watchlist_entries),
        'episodes_watched': sum(e.progress for e in watchlist_entries),
        'total_reviews': len(user_reviews),
        'reviews_count': len(user_reviews),
        'comments_count': user.comments.count(),
        'average_rating': round(avg_rating, 1)
    }
    
    return jsonify(stats), 200


@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard data for current user"""
    current_user_id = int(get_jwt_identity())
    print(f"[Dashboard] User ID from token: {current_user_id}")
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get stats
    watchlist_entries = WatchList.query.filter_by(user_id=current_user_id).all()
    
    # Get all user reviews for average rating calculation
    user_reviews = Review.query.filter_by(user_id=current_user_id).all()
    
    # Calculate average rating from reviews
    if user_reviews:
        avg_rating = sum(r.rating for r in user_reviews) / len(user_reviews)
    else:
        avg_rating = 0.0
    
    stats = {
        'total_anime': len(watchlist_entries),
        'watching': sum(1 for e in watchlist_entries if e.status == 'watching'),
        'completed': sum(1 for e in watchlist_entries if e.status == 'completed'),
        'on_hold': sum(1 for e in watchlist_entries if e.status == 'on_hold'),
        'dropped': sum(1 for e in watchlist_entries if e.status == 'dropped'),
        'plan_to_watch': sum(1 for e in watchlist_entries if e.status == 'plan_to_watch'),
        'total_episodes': sum(e.progress for e in watchlist_entries),
        'total_reviews': len(user_reviews),
        'average_rating': round(avg_rating, 1)
    }
    
    # Recent activity
    recent_logs = WatchList.query.filter_by(user_id=current_user_id)\
        .order_by(WatchList.updated_at.desc())\
        .limit(5)\
        .all()
    
    recent_reviews = Review.query.filter_by(user_id=current_user_id)\
        .order_by(Review.created_at.desc())\
        .limit(3)\
        .all()
    
    # Currently watching
    currently_watching = WatchList.query.filter_by(
        user_id=current_user_id,
        status='watching'
    ).order_by(WatchList.updated_at.desc()).limit(6).all()
    
    return jsonify({
        'user': user.to_dict(include_email=True),
        'stats': stats,
        'recent_logs': [l.to_dict() for l in recent_logs],
        'recent_reviews': [r.to_dict(include_anime=True) for r in recent_reviews],
        'currently_watching': [w.to_dict() for w in currently_watching]
    }), 200
