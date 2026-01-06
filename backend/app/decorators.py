"""
Role-based Access Control Decorators for AnimeLog

This module provides decorators for protecting routes based on user roles.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User


def admin_required():
    """
    Decorator that protects an endpoint to admin users only.
    Must be used after @jwt_required() decorator.
    
    Usage:
        @anime_bp.route('/admin-only', methods=['POST'])
        @jwt_required()
        @admin_required()
        def admin_only_route():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Get the current user ID from JWT
            current_user_id = get_jwt_identity()
            
            if not current_user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            # Fetch user from database to check role
            user = User.query.get(int(current_user_id))
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Check if user has admin role
            if not user.is_admin():
                return jsonify({
                    'error': 'Forbidden',
                    'message': 'Admin privileges required to perform this action'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def role_required(*allowed_roles):
    """
    Decorator that protects an endpoint to users with specific roles.
    Must be used after @jwt_required() decorator.
    
    Usage:
        @anime_bp.route('/moderator-action', methods=['POST'])
        @jwt_required()
        @role_required('admin', 'moderator')
        def moderator_action():
            ...
    
    Args:
        allowed_roles: Variable number of role strings that are allowed to access the endpoint
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Get the current user ID from JWT
            current_user_id = get_jwt_identity()
            
            if not current_user_id:
                return jsonify({'error': 'Authentication required'}), 401
            
            # Fetch user from database to check role
            user = User.query.get(int(current_user_id))
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Check if user's role is in the allowed roles
            if user.role not in allowed_roles:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'This action requires one of the following roles: {", ".join(allowed_roles)}'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user_role():
    """
    Helper function to get the current user's role from JWT.
    Returns None if not authenticated or user not found.
    
    Usage:
        role = get_current_user_role()
        if role == 'admin':
            # Do admin stuff
    """
    try:
        verify_jwt_in_request(optional=True)
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return None
        
        user = User.query.get(int(current_user_id))
        return user.role if user else None
    except:
        return None
