class NotificationService:
    def send_push(self, user_id: int, message: str):
        print(f"Push to {user_id}: {message}")
        return True
