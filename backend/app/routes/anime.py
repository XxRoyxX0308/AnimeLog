"""
Anime Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import or_
from app import db
from app.models import Anime, WatchList
from app.decorators import admin_required

anime_bp = Blueprint('anime', __name__)


def get_optional_user_id():
    """Get user ID if authenticated, otherwise None"""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except:
        return None


@anime_bp.route('', methods=['GET'])
def get_anime_list():
    """Get paginated list of anime with filters (Public endpoint)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)  # Max 50 per page
    
    # Filters
    search = request.args.get('search', '').strip()
    genre = request.args.get('genre', '').strip()
    status = request.args.get('status', '').strip()
    type_filter = request.args.get('type', '').strip()
    season = request.args.get('season', '').strip()
    year = request.args.get('year', '').strip()
    sort_by = request.args.get('sort_by', 'rating')  # rating, title, newest
    
    query = Anime.query
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Anime.title.ilike(f'%{search}%'),
                Anime.title_japanese.ilike(f'%{search}%')
            )
        )
    
    if genre:
        query = query.filter(Anime.genres.ilike(f'%{genre}%'))
    
    if status:
        query = query.filter(Anime.status == status)
    
    if type_filter:
        query = query.filter(Anime.type == type_filter)
    
    if season:
        query = query.filter(Anime.season.ilike(f'%{season}%'))
    
    if year:
        # Year can be in season field like "Fall 2024" or in aired_from date
        query = query.filter(
            or_(
                Anime.season.ilike(f'%{year}%'),
                db.extract('year', Anime.aired_from) == int(year)
            )
        )
    
    # Sorting
    if sort_by == 'rating':
        query = query.order_by(Anime.average_rating.desc())
    elif sort_by == 'title':
        query = query.order_by(Anime.title.asc())
    elif sort_by == 'newest':
        query = query.order_by(Anime.created_at.desc())
    else:
        query = query.order_by(Anime.average_rating.desc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'anime': [a.to_dict() for a in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@anime_bp.route('/<int:anime_id>', methods=['GET'])
def get_anime_detail(anime_id):
    """Get detailed anime information (Public endpoint)"""
    anime = Anime.query.get(anime_id)
    
    if not anime:
        return jsonify({'error': 'Anime not found'}), 404
    
    data = anime.to_dict(include_reviews=True)
    
    # Add user's watchlist status if authenticated
    user_id = get_optional_user_id()
    if user_id:
        watchlist_entry = WatchList.query.filter_by(
            user_id=user_id, 
            anime_id=anime_id
        ).first()
        if watchlist_entry:
            data['user_watchlist'] = watchlist_entry.to_dict(include_anime=False)
    
    return jsonify({'anime': data}), 200


@anime_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get site-wide statistics (Public endpoint)"""
    from app.models import User, Review
    
    anime_count = Anime.query.count()
    user_count = User.query.count()
    review_count = Review.query.count()
    episodes_logged = db.session.query(db.func.sum(WatchList.progress)).scalar() or 0
    
    return jsonify({
        'stats': {
            'anime_count': anime_count,
            'user_count': user_count,
            'review_count': review_count,
            'episodes_logged': episodes_logged
        }
    }), 200


@anime_bp.route('/genres', methods=['GET'])
def get_genres():
    """Get list of all genres (Public endpoint)"""
    # Get all unique genres
    anime_list = Anime.query.with_entities(Anime.genres).all()
    genres = set()
    for anime in anime_list:
        if anime.genres:
            for genre in anime.genres.split(','):
                genres.add(genre.strip())
    
    return jsonify({'genres': sorted(list(genres))}), 200


@anime_bp.route('/seasons', methods=['GET'])
def get_seasons():
    """Get list of all seasons (Public endpoint)"""
    seasons = Anime.query.with_entities(Anime.season).distinct().all()
    season_list = [s[0] for s in seasons if s[0]]
    
    return jsonify({'seasons': sorted(season_list, reverse=True)}), 200


@anime_bp.route('/trending', methods=['GET'])
def get_trending():
    """Get trending anime (Public endpoint)"""
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 20)
    
    trending = Anime.query.order_by(
        Anime.rating_count.desc(),
        Anime.average_rating.desc()
    ).limit(limit).all()
    
    return jsonify({
        'anime': [a.to_dict() for a in trending]
    }), 200


@anime_bp.route('/recent', methods=['GET'])
def get_recent():
    """Get recently added anime (Public endpoint)"""
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 20)
    
    recent = Anime.query.order_by(Anime.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'anime': [a.to_dict() for a in recent]
    }), 200


# Admin routes for managing anime (requires admin role)
@anime_bp.route('', methods=['POST'])
@jwt_required()
@admin_required()
def create_anime():
    """Create a new anime entry (Admin only)"""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    anime = Anime(
        title=data['title'],
        title_japanese=data.get('title_japanese'),
        synopsis=data.get('synopsis', ''),
        cover_image=data.get('cover_image', ''),
        banner_image=data.get('banner_image', ''),
        type=data.get('type', 'TV'),
        episodes=data.get('episodes', 0),
        status=data.get('status', 'Ongoing'),
        season=data.get('season'),
        genres=','.join(data.get('genres', [])) if isinstance(data.get('genres'), list) else data.get('genres', ''),
        studios=','.join(data.get('studios', [])) if isinstance(data.get('studios'), list) else data.get('studios', '')
    )
    
    try:
        db.session.add(anime)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create anime'}), 500
    
    return jsonify({
        'message': 'Anime created successfully',
        'anime': anime.to_dict()
    }), 201


@anime_bp.route('/<int:anime_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_anime(anime_id):
    """Delete an anime entry (Admin only)"""
    anime = Anime.query.get(anime_id)
    
    if not anime:
        return jsonify({'error': 'Anime not found'}), 404
    
    try:
        db.session.delete(anime)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete anime'}), 500
    
    return jsonify({
        'message': 'Anime deleted successfully'
    }), 200
