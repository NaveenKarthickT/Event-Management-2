from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# ─── DATABASE CONFIGURATION ───────────────────────────────────────────────────
# SQLite (local file — easy for development)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'events.db')}"

# To switch to PostgreSQL, replace the line above with:
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost:5432/eventdb'
# Then install: pip install psycopg2-binary

# To switch to MySQL, use:
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://username:password@localhost/eventdb'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'

db = SQLAlchemy(app)

# ─── MODELS ───────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(100), nullable=False)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role     = db.Column(db.String(20), default='user')  # user | organizer | admin
    bookings = db.relationship('Booking', backref='user', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role}


class Event(db.Model):
    __tablename__ = 'events'
    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(200), nullable=False)
    description  = db.Column(db.Text)
    date         = db.Column(db.String(50), nullable=False)
    location     = db.Column(db.String(200))
    seats        = db.Column(db.Integer, default=100)
    price        = db.Column(db.Float, default=0.0)
    category     = db.Column(db.String(50), default='General')
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    bookings     = db.relationship('Booking', backref='event', lazy=True)

    def to_dict(self):
        booked = len(self.bookings)
        return {
            'id': self.id, 'title': self.title, 'description': self.description,
            'date': self.date, 'location': self.location, 'seats': self.seats,
            'price': self.price, 'category': self.category,
            'organizer_id': self.organizer_id,
            'available_seats': self.seats - booked, 'booked_count': booked
        }


class Booking(db.Model):
    __tablename__ = 'bookings'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id   = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    ticket_id  = db.Column(db.String(50), unique=True)
    booked_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'user_id': self.user_id, 'event_id': self.event_id,
            'ticket_id': self.ticket_id, 'booked_at': str(self.booked_at)
        }

# ─── ROUTES ───────────────────────────────────────────────────────────────────

# --- Auth ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    user = User(name=data['name'], email=data['email'],
                password=data['password'], role=data.get('role', 'user'))
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully', 'user': user.to_dict()}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'message': 'Login successful', 'user': user.to_dict()})


# --- Events ---
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([e.to_dict() for e in events])


@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict())


@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.json
    event = Event(
        title=data['title'], description=data.get('description', ''),
        date=data['date'], location=data['location'],
        seats=data.get('seats', 100), price=data.get('price', 0.0),
        category=data.get('category', 'General'),
        organizer_id=data.get('organizer_id')
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.json
    for field in ['title', 'description', 'date', 'location', 'seats', 'price', 'category']:
        if field in data:
            setattr(event, field, data[field])
    db.session.commit()
    return jsonify(event.to_dict())


@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted'})


# --- Bookings ---
@app.route('/api/bookings', methods=['POST'])
def book_event():
    data = request.json
    event = Event.query.get_or_404(data['event_id'])
    if len(event.bookings) >= event.seats:
        return jsonify({'error': 'No seats available'}), 400
    existing = Booking.query.filter_by(user_id=data['user_id'], event_id=data['event_id']).first()
    if existing:
        return jsonify({'error': 'Already booked'}), 400
    import uuid
    booking = Booking(user_id=data['user_id'], event_id=data['event_id'],
                      ticket_id=str(uuid.uuid4())[:8].upper())
    db.session.add(booking)
    db.session.commit()
    return jsonify({'message': 'Booking confirmed', 'booking': booking.to_dict()}), 201


@app.route('/api/bookings/user/<int:user_id>', methods=['GET'])
def user_bookings(user_id):
    bookings = Booking.query.filter_by(user_id=user_id).all()
    result = []
    for b in bookings:
        d = b.to_dict()
        d['event'] = b.event.to_dict()
        result.append(d)
    return jsonify(result)


@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


# ─── INIT DB WITH SEED DATA ───────────────────────────────────────────────────
def seed():
    if User.query.count() == 0:
        admin = User(name='Admin', email='admin@example.com', password='admin123', role='admin')
        org   = User(name='Event Organizer', email='org@example.com', password='org123', role='organizer')
        usr   = User(name='John Doe', email='user@example.com', password='user123', role='user')
        db.session.add_all([admin, org, usr])
        db.session.commit()

        events = [
            Event(title='Music Fest 2025', description='Annual outdoor music festival.',
                  date='2025-06-10', location='Mumbai', seats=500, price=499.0,
                  category='Music', organizer_id=org.id),
            Event(title='Tech Summit', description='Technology and innovation conference.',
                  date='2025-07-15', location='Bangalore', seats=200, price=999.0,
                  category='Tech', organizer_id=org.id),
            Event(title='Art Exhibition', description='Contemporary art showcase.',
                  date='2025-08-20', location='Delhi', seats=150, price=299.0,
                  category='Art', organizer_id=org.id),
            Event(title='Food Carnival', description='Street food festival.',
                  date='2025-09-05', location='Chennai', seats=1000, price=0.0,
                  category='Food', organizer_id=org.id),
        ]
        db.session.add_all(events)
        db.session.commit()
        print("✅ Database seeded.")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed()
    app.run(debug=True, port=5000)