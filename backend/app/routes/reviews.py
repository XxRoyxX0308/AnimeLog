"""
Reviews Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models import Review, Anime, User

reviews_bp = Blueprint('reviews', __name__)


def get_optional_user_id():
    """Get user ID if authenticated, otherwise None"""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except:
        return None


@reviews_bp.route('', methods=['GET'])
def get_reviews():
    """Get paginated list of reviews (Public - Community Reviews Page)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    # Filters
    anime_id = request.args.get('anime_id', type=int)
    user_id = request.args.get('user_id', type=int)
    search = request.args.get('search', '').strip()
    sort_by = request.args.get('sort_by', 'recent')  # recent, rating, likes
    sort = request.args.get('sort', '').strip()  # Alternate param name: newest, popular, highest
    
    query = Review.query
    
    if anime_id:
        query = query.filter(Review.anime_id == anime_id)
    
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    # Search filter - search in review title, content, or anime title
    if search:
        from sqlalchemy import or_
        query = query.join(Anime).filter(
            or_(
                Review.title.ilike(f'%{search}%'),
                Review.content.ilike(f'%{search}%'),
                Anime.title.ilike(f'%{search}%')
            )
        )
    
    # Sorting - handle both sort_by and sort params
    effective_sort = sort if sort else sort_by
    if effective_sort == 'rating' or effective_sort == 'highest':
        query = query.order_by(Review.rating.desc())
    elif effective_sort == 'likes' or effective_sort == 'popular':
        query = query.order_by(Review.likes_count.desc())
    else:  # recent / newest
        query = query.order_by(Review.created_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'reviews': [r.to_dict(include_anime=True, include_comments=True) for r in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@reviews_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    """Get single review with comments (Public)"""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    return jsonify({
        'review': review.to_dict(include_anime=True, include_comments=True)
    }), 200


@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """Create a new review (Authenticated)"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    anime_id = data.get('anime_id')
    rating = data.get('rating')
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    
    errors = {}
    
    if not anime_id:
        errors['anime_id'] = 'Anime ID is required'
    
    if not rating:
        errors['rating'] = 'Rating is required'
    elif not isinstance(rating, int) or rating < 1 or rating > 10:
        errors['rating'] = 'Rating must be between 1 and 10'
    
    if not title:
        errors['title'] = 'Review title is required'
    elif len(title) > 255:
        errors['title'] = 'Title must be less than 255 characters'
    
    if not content:
        errors['content'] = 'Review content is required'
    
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check if anime exists
    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({'error': 'Anime not found'}), 404
    
    # Create review
    review = Review(
        user_id=current_user_id,
        anime_id=anime_id,
        rating=rating,
        title=title,
        content=content
    )
    
    try:
        db.session.add(review)
        db.session.commit()
        
        # Update anime rating
        anime.update_rating()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create review', 'success': False}), 500
    
    return jsonify({
        'message': 'Review created successfully',
        'success': True,
        'review': review.to_dict(include_anime=True)
    }), 201


@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    """Update a review (Owner only)"""
    current_user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    if review.user_id != current_user_id:
        return jsonify({'error': 'Not authorized to edit this review'}), 403
    
    data = request.get_json()
    
    if 'rating' in data:
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 10:
            return jsonify({'error': 'Rating must be between 1 and 10'}), 400
        review.rating = rating
    
    if 'title' in data:
        title = data['title'].strip()
        if not title:
            return jsonify({'error': 'Title cannot be empty'}), 400
        if len(title) > 255:
            return jsonify({'error': 'Title must be less than 255 characters'}), 400
        review.title = title
    
    if 'content' in data:
        content = data['content'].strip()
        if not content:
            return jsonify({'error': 'Review content cannot be empty'}), 400
        review.content = content
    
    try:
        db.session.commit()
        
        # Update anime rating
        review.anime.update_rating()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update review', 'success': False}), 500
    
    return jsonify({
        'message': 'Review updated successfully',
        'success': True,
        'review': review.to_dict(include_anime=True)
    }), 200


@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """Delete a review (Owner only)"""
    current_user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    if review.user_id != current_user_id:
        return jsonify({'error': 'Not authorized to delete this review'}), 403
    
    anime = review.anime
    
    try:
        db.session.delete(review)
        db.session.commit()
        
        # Update anime rating
        anime.update_rating()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete review'}), 500
    
    return jsonify({'message': 'Review deleted successfully'}), 200


@reviews_bp.route('/<int:review_id>/like', methods=['POST'])
@jwt_required()
def like_review(review_id):
    """Like a review (Authenticated)"""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    # Simple like increment (in production, you'd track who liked)
    review.likes_count += 1
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to like review'}), 500
    
    return jsonify({
        'message': 'Review liked',
        'likes_count': review.likes_count
    }), 200


@reviews_bp.route('/my-reviews', methods=['GET'])
@jwt_required()
def get_my_reviews():
    """Get current user's reviews (My Logs Page)"""
    current_user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Review.query.filter_by(user_id=current_user_id).order_by(Review.created_at.desc())
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
