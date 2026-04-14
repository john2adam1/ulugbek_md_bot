from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from strings import STRINGS

def get_main_menu() -> ReplyKeyboardMarkup:
    buttons = [
        [KeyboardButton(text=STRINGS["menu_about_me"])],
        [KeyboardButton(text=STRINGS["menu_about_course"])],
        [KeyboardButton(text=STRINGS["menu_free_lessons"])],
        [KeyboardButton(text=STRINGS["menu_enroll"])]
    ]
    return ReplyKeyboardMarkup(
        keyboard=buttons,
        resize_keyboard=True,
        input_field_placeholder="Select an option"
    )
