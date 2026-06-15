import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv("DATABASE_URL")
if database_url:
    engine = create_engine(database_url)
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;"))
            print("Added google_id column.")
        except Exception as e:
            print(f"Error adding google_id (might already exist): {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN fcm_token VARCHAR;"))
            print("Added fcm_token column.")
        except Exception as e:
            print(f"Error adding fcm_token (might already exist): {e}")

        # The new tables (notifications, password_reset_tokens) will be auto-created by create_all 
        # on app startup since they don't exist yet, but the existing users table needs this ALTER.
        print("Migration done!")
else:
    print("No DATABASE_URL found.")
