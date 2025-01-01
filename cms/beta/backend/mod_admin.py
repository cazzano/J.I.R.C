from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sqlite3
import os

mod_admin_bp = Blueprint('mod_admin', __name__)

# Database setup
DATABASE = 'admin.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS admin_credentials (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database
init_db()

@mod_admin_bp.route('/api/update-credentials', methods=['POST'])
@jwt_required()
def update_credentials():
    data = request.get_json()
    
    current_email = data.get('current_email')
    current_password = data.get('current_password')
    new_email = data.get('new_email')
    new_password = data.get('new_password')

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    # Get the current user's email from the JWT token
    current_user_email = get_jwt_identity()

    # Verify current credentials
    c.execute('SELECT * FROM admin_credentials WHERE email = ?', (current_user_email,))
    user = c.fetchone()

    if user is None or user[2] != current_password:
        return jsonify({'success': False, 'message': 'Current credentials are incorrect'}), 401

    # Update credentials
    c.execute('UPDATE admin_credentials SET email = ?, password = ? WHERE email = ?', 
              (new_email, new_password, current_user_email))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Credentials updated successfully'})
