from sqlalchemy.orm import Session

from app.models.user import User

# from app.crud import user as crud_user


class UserService:
    def get_user_stats(self, db: Session, user_id: int):
        """
        Placeholder for fetching user statistics (streaks, etc).
        """
        return {"streak": 5, "total_checkins": 20}


user_service = UserService()
