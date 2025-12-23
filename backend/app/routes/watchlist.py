"""
Watchlist Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from app import db
from app.models import WatchList, Anime

watchlist_bp = Blueprint('watchlist', __name__)

VALID_STATUSES = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']


@watchlist_bp.route('', methods=['GET'])
@jwt_required()
def get_watchlist():
    """Get current user's watchlist (My Logs)"""
    current_user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    # Accept both 'limit' and 'per_page' for frontend compatibility
    per_page = request.args.get('limit', request.args.get('per_page', 20, type=int), type=int)
    per_page = min(per_page, 50)
    
    # Filters
    status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'updated')  # updated, title, score
    
    query = WatchList.query.filter_by(user_id=current_user_id)
    
    if status and status in VALID_STATUSES:
        query = query.filter(WatchList.status == status)
    
    # Sorting
    if sort_by == 'title':
        query = query.join(Anime).order_by(Anime.title.asc())
    elif sort_by == 'score':
        query = query.order_by(WatchList.score.desc().nullslast())
    else:  # updated
        query = query.order_by(WatchList.updated_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'watchlist': [w.to_dict() for w in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@watchlist_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_watchlist_stats():
    """Get watchlist statistics for dashboard"""
    current_user_id = int(get_jwt_identity())
    
    stats = {
        'total': WatchList.query.filter_by(user_id=current_user_id).count(),
        'watching': WatchList.query.filter_by(user_id=current_user_id, status='watching').count(),
        'completed': WatchList.query.filter_by(user_id=current_user_id, status='completed').count(),
        'on_hold': WatchList.query.filter_by(user_id=current_user_id, status='on_hold').count(),
        'dropped': WatchList.query.filter_by(user_id=current_user_id, status='dropped').count(),
        'plan_to_watch': WatchList.query.filter_by(user_id=current_user_id, status='plan_to_watch').count()
    }
    
    # Calculate total episodes watched
    entries = WatchList.query.filter_by(user_id=current_user_id).all()
    stats['episodes_watched'] = sum(e.progress for e in entries)
    
    # Average score
    scored_entries = [e for e in entries if e.score]
    stats['average_score'] = round(sum(e.score for e in scored_entries) / len(scored_entries), 1) if scored_entries else 0
    
    return jsonify({'stats': stats}), 200


@watchlist_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_logs():
    """Get recent watchlist updates for dashboard"""
    current_user_id = int(get_jwt_identity())
    limit = request.args.get('limit', 5, type=int)
    limit = min(limit, 20)
    
    recent = WatchList.query.filter_by(user_id=current_user_id)\
        .order_by(WatchList.updated_at.desc())\
        .limit(limit)\
        .all()
    
    return jsonify({
        'watchlist': [w.to_dict() for w in recent]
    }), 200


@watchlist_bp.route('', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    """Add anime to watchlist"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    anime_id = data.get('anime_id')
    status = data.get('status', 'plan_to_watch')
    
    if not anime_id:
        return jsonify({'error': 'Anime ID is required'}), 400
    
    if status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'}), 400
    
    # Check if anime exists
    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({'error': 'Anime not found'}), 404
    
    # Check if already in watchlist
    existing = WatchList.query.filter_by(user_id=current_user_id, anime_id=anime_id).first()
    if existing:
        return jsonify({'error': 'Anime already in watchlist'}), 409
    
    entry = WatchList(
        user_id=current_user_id,
        anime_id=anime_id,
        status=status,
        progress=data.get('progress', 0),
        score=data.get('score'),
        notes=data.get('notes', '')
    )
    
    # Set dates based on status
    if status == 'watching':
        entry.started_at = date.today()
    elif status == 'completed':
        entry.started_at = date.today()
        entry.completed_at = date.today()
    
    try:
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add to watchlist'}), 500
    
    return jsonify({
        'message': 'Added to watchlist',
        'watchlist_entry': entry.to_dict()
    }), 201


@watchlist_bp.route('/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_watchlist_entry(entry_id):
    """Update watchlist entry"""
    current_user_id = int(get_jwt_identity())
    entry = WatchList.query.get(entry_id)
    
    if not entry:
        return jsonify({'error': 'Watchlist entry not found'}), 404
    
    if entry.user_id != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    data = request.get_json()
    
    if 'status' in data:
        if data['status'] not in VALID_STATUSES:
            return jsonify({'error': f'Invalid status'}), 400
        old_status = entry.status
        entry.status = data['status']
        
        # Auto-set dates
        if data['status'] == 'watching' and not entry.started_at:
            entry.started_at = date.today()
        elif data['status'] == 'completed' and not entry.completed_at:
            entry.completed_at = date.today()
            if not entry.started_at:
                entry.started_at = date.today()
    
    if 'progress' in data:
        progress = data['progress']
        if isinstance(progress, int) and progress >= 0:
            entry.progress = min(progress, entry.anime.episodes if entry.anime.episodes > 0 else progress)
            
            # Auto-complete if all episodes watched
            if entry.anime.episodes > 0 and entry.progress >= entry.anime.episodes:
                entry.status = 'completed'
                if not entry.completed_at:
                    entry.completed_at = date.today()
    
    if 'score' in data:
        score = data['score']
        if score is None or (isinstance(score, int) and 1 <= score <= 10):
            entry.score = score
    
    if 'notes' in data:
        entry.notes = data['notes'][:1000] if data['notes'] else ''
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update watchlist'}), 500
    
    return jsonify({
        'message': 'Watchlist updated',
        'watchlist_entry': entry.to_dict()
    }), 200


@watchlist_bp.route('/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(entry_id):
    """Remove anime from watchlist"""
    current_user_id = int(get_jwt_identity())
    entry = WatchList.query.get(entry_id)
    
    if not entry:
        return jsonify({'error': 'Watchlist entry not found'}), 404
    
    if entry.user_id != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    try:
        db.session.delete(entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove from watchlist'}), 500
    
    return jsonify({'message': 'Removed from watchlist'}), 200


@watchlist_bp.route('/anime/<int:anime_id>', methods=['GET'])
@jwt_required()
def get_anime_watchlist_status(anime_id):
    """Check if anime is in user's watchlist"""
    current_user_id = int(get_jwt_identity())
    
    entry = WatchList.query.filter_by(user_id=current_user_id, anime_id=anime_id).first()
    
    if not entry:
        return jsonify({'in_watchlist': False}), 200
    
    return jsonify({
        'in_watchlist': True,
        'watchlist_entry': entry.to_dict()
    }), 200
