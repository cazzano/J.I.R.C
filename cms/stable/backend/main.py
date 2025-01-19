from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import jwt
import datetime
import sqlite3

app = Flask(__name__)
CORS(app)

# SQLite Database Setup
def init_db():
    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()

    # Create credentials table if not exists
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0
    )
    ''')

    # Insert default admin if not exists
    cursor.execute('''
    INSERT OR IGNORE INTO credentials
    (email, password, is_admin) VALUES (?, ?, ?)
    ''', ('kali@kali.com', 'password123', 1))

    conn.commit()
    conn.close()

# Initialize Database
init_db()

# Secret key for JWT
app.config['SECRET_KEY'] = 'your_super_secret_key'

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    # Database Connection
    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()

    # Check Credentials
    cursor.execute('''
    SELECT * FROM credentials
    WHERE email = ? AND password = ? AND is_admin = 1
    ''', (email, password))

    user = cursor.fetchone()
    conn.close()

    if user:
        # Create JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'success': True,
            'token': token,
            'message': 'Login Successful'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid Credentials'
        }), 401

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    token = request.json.get('token')

    try:
        # Decode the token
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])

        # Optional: Additional DB validation
        conn = sqlite3.connect('auth.db')
        cursor = conn.cursor()

        cursor.execute('''
        SELECT * FROM credentials
        WHERE email = ? AND is_admin = 1
        ''', (decoded.get('email'),))

        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({
                'valid': False,
                'message': 'User not found'
            }), 401

        return jsonify({
            'valid': True,
            'email': decoded.get('email')
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            'valid': False,
            'message': 'Token has expired'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'valid': False,
            'message': 'Invalid token'
        }), 401

# Optional: Add user management route
@app.route('/api/add-admin', methods=['POST'])
def add_admin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()

    try:
        cursor.execute('''
        INSERT INTO credentials
        (email, password, is_admin) VALUES (?, ?, ?)
        ''', (email, password, 1))

        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Admin added successfully'
        }), 201

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            'success': False,
            'message': 'Email already exists'
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
