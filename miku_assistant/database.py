import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self, db_path="miku.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self.create_tables()

    def create_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                likes TEXT,
                preferences TEXT
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                role TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()

    def get_user(self, user_id=1):
        self.cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
        user = self.cursor.fetchone()
        if not user:
            self.cursor.execute("INSERT INTO users (name, likes, preferences) VALUES (?, ?, ?)", ("User", "Anime, Tech", "{}"))
            self.conn.commit()
            return self.get_user(user_id)
        return {"id": user[0], "name": user[1], "likes": user[2], "preferences": json.loads(user[3])}

    def update_user(self, user_id, name=None, likes=None, preferences=None):
        if name:
            self.cursor.execute("UPDATE users SET name=? WHERE id=?", (name, user_id))
        if likes:
            self.cursor.execute("UPDATE users SET likes=? WHERE id=?", (likes, user_id))
        if preferences:
            self.cursor.execute("UPDATE users SET preferences=? WHERE id=?", (json.dumps(preferences), user_id))
        self.conn.commit()

    def add_message(self, user_id, role, content):
        self.cursor.execute("INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)", (user_id, role, content))
        self.conn.commit()

    def get_history(self, user_id, limit=10):
        self.cursor.execute("SELECT role, content FROM conversations WHERE user_id=? ORDER BY id DESC LIMIT ?", (user_id, limit))
        rows = self.cursor.fetchall()
        return [{"role": row[0], "content": row[1]} for row in reversed(rows)]

    def close(self):
        self.conn.close()
