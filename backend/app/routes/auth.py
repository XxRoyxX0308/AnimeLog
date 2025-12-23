"""
Authentication Routes for AnimeLog
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from email_validator import validate_email, EmailNotValidError
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    # Validation
    errors = {}
    
    if not email:
        errors['email'] = 'Email is required'
    else:
        try:
            validate_email(email)
        except EmailNotValidError:
            errors['email'] = 'Invalid email format'
    
    if not username:
        errors['username'] = 'Username is required'
    elif len(username) < 3:
        errors['username'] = 'Username must be at least 3 characters'
    elif len(username) > 50:
        errors['username'] = 'Username must be less than 50 characters'
    
    if not password:
        errors['password'] = 'Password is required'
    elif len(password) < 6:
        errors['password'] = 'Password must be at least 6 characters'
    
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create user
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(
        email=email,
        username=username,
        password_hash=password_hash
    )
    
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict(include_email=True),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with email/password"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.password_hash:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(include_email=True),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(current_user_id))
    
    return jsonify({
        'access_token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict(include_email=True)
    }), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user profile"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'username' in data:
        new_username = data['username'].strip()
        if new_username != user.username:
            if User.query.filter_by(username=new_username).first():
                return jsonify({'error': 'Username already taken'}), 409
            user.username = new_username
    
    if 'bio' in data:
        user.bio = data['bio'][:500] if data['bio'] else ''
    
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url'][:500] if data['avatar_url'] else ''
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500
    
    return jsonify({
        'message': 'Profile updated',
        'user': user.to_dict(include_email=True)
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password'}), 500
    
    return jsonify({'message': 'Password changed successfully'}), 200
