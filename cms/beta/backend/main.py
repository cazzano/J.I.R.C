from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_super_secret_key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')
jwt = JWTManager(app)

# Database Setup
DATABASE = 'admin.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Create admin credentials table
    c.execute('''
        CREATE TABLE IF NOT EXISTS admin_credentials (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Check if default admin exists
    c.execute('SELECT * FROM admin_credentials WHERE email = ?', ('admin@kala.com',))
    if not c.fetchone():
        # Hash the default password
        hashed_password = generate_password_hash('password456')
        c.execute('INSERT INTO admin_credentials (email, password) VALUES (?, ?)', 
                  ('admin@kala.com', hashed_password))
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

@app.route('/api/login', methods=['POST'])
def login():
    # Get credentials from request
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    # Database connection
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    # Find user
    c.execute('SELECT * FROM admin_credentials WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()

    # Validate credentials
    if user and check_password_hash(user[2], password):
        # Create access token
        access_token = create_access_token(identity=email)
        return jsonify({
            'success': True,
            'token': access_token,
            'message': 'Login Successful'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid Credentials'
        }), 401

@app.route('/api/update-credentials', methods=['POST'])
@jwt_required()
def update_credentials():
    data = request.get_json()
    
    current_email = data.get('current_email')
    current_password = data.get('current_password')
    new_email = data.get('new_email')
    new_password = data.get('new_password')

    # Get the current user's email from the JWT token
    current_user_email = get_jwt_identity()

    # Database connection
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    # Verify current credentials
    c.execute('SELECT * FROM admin_credentials WHERE email = ?', (current_user_email,))
    user = c.fetchone()

    if user is None or not check_password_hash(user[2], current_password):
        conn.close()
        return jsonify({
            'success': False, 
            'message': 'Current credentials are incorrect'
        }), 401

    try:
        # Hash new password
        hashed_new_password = generate_password_hash(new_password)
        
        # Update credentials
        c.execute(
            'UPDATE admin_credentials SET email = ?, password = ? WHERE email = ?', 
            (new_email, hashed_new_password, current_user_email)
        )
        conn.commit()
        conn.close()

        return jsonify({
            'success': True, 
            'message': 'Credentials updated successfully'
        }), 200
    except Exception as e:
        conn.close()
        return jsonify({
            'success': False, 
            'message': str(e)
        }), 500

@app.route('/api/validate-token', methods=['POST'])
@jwt_required()
def validate_token():
    current_user = get_jwt_identity()
    return jsonify({
        'valid': True,
        'email': current_user
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
