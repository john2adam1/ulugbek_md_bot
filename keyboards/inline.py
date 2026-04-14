from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from strings import STRINGS
from config import settings

def get_enroll_kb() -> InlineKeyboardMarkup:
    # Constructing the manager URL from the username in settings
    manager_url = f"https://t.me/{settings.manager_username.lstrip('@')}"
    
    buttons = [
        [InlineKeyboardButton(text=STRINGS["manager_button"], url=manager_url)]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)
