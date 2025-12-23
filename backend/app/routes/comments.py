"""
Comments Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Comment, Review

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('/review/<int:review_id>', methods=['GET'])
def get_comments(review_id):
    """Get comments for a review (Public)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    query = Comment.query.filter_by(review_id=review_id).order_by(Comment.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'comments': [c.to_dict() for c in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@comments_bp.route('', methods=['POST'])
@jwt_required()
def create_comment():
    """Create a comment on a review (Authenticated)"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    review_id = data.get('review_id')
    content = data.get('content', '').strip()
    
    if not review_id:
        return jsonify({'error': 'Review ID is required'}), 400
    
    if not content:
        return jsonify({'error': 'Comment content is required'}), 400
    
    if len(content) > 1000:
        return jsonify({'error': 'Comment must be less than 1000 characters'}), 400
    
    # Check if review exists
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    comment = Comment(
        user_id=current_user_id,
        review_id=review_id,
        content=content
    )
    
    try:
        db.session.add(comment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create comment'}), 500
    
    return jsonify({
        'message': 'Comment created successfully',
        'comment': comment.to_dict()
    }), 201


@comments_bp.route('/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    """Update a comment (Owner only)"""
    current_user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    if comment.user_id != current_user_id:
        return jsonify({'error': 'Not authorized to edit this comment'}), 403
    
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'error': 'Comment content is required'}), 400
    
    if len(content) > 1000:
        return jsonify({'error': 'Comment must be less than 1000 characters'}), 400
    
    comment.content = content
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update comment'}), 500
    
    return jsonify({
        'message': 'Comment updated successfully',
        'comment': comment.to_dict()
    }), 200


@comments_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment (Owner only)"""
    current_user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    if comment.user_id != current_user_id:
        return jsonify({'error': 'Not authorized to delete this comment'}), 403
    
    try:
        db.session.delete(comment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete comment'}), 500
    
    return jsonify({'message': 'Comment deleted successfully'}), 200
