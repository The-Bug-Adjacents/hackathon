import sqlite3

def create_database():



    """Creates and initializes the SQLite database. This version allows NULL for profileName for diagnostic purposes."""
    conn = None
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        # Drop existing tables for a clean migration. NOTE: This is a destructive action.
        print("Dropping old tables for schema migration...")
        cursor.execute("DROP TABLE IF EXISTS messages")
        cursor.execute("DROP TABLE IF EXISTS chat_logs")
        cursor.execute("DROP TABLE IF EXISTS model_profiles")
        cursor.execute("DROP TABLE IF EXISTS users")

        # --- Create Tables with Correct Schema ---
        print("Creating new tables with diagnostic schema...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                hashed_pass TEXT NOT NULL
            )
        ''')

        # --- DIAGNOSTIC CHANGE: profileName is now allowed to be NULL ---
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_profiles (
                userId TEXT NOT NULL,
                profileId INTEGER NOT NULL,
                profileName TEXT NOT NULL, -- Temporarily allowing NULL to diagnose the issue
                model TEXT NOT NULL,
                UNIQUE (userId, profileId)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_logs (
                chatlogId INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                profileId INTEGER NOT NULL,
                FOREIGN KEY (userId, profileId) REFERENCES model_profiles (userId, profileId)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                chatlogId INTEGER NOT NULL,
                messageId INTEGER NOT NULL,
                sender TEXT NOT NULL CHECK(sender IN ('user', 'llm')),
                messageContent TEXT NOT NULL,
                PRIMARY KEY (chatlogId, messageId),
                FOREIGN KEY (chatlogId) REFERENCES chat_logs (chatlogId)
            )
        ''')

        conn.commit()
        print("Database schema has been updated for diagnostics.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    create_database()
