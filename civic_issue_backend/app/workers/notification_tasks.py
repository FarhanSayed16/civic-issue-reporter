from time import sleep

def send_notification(user_id: int, message: str):
    sleep(0.5)
    print(f"Notification sent to {user_id}: {message}")
    return True
