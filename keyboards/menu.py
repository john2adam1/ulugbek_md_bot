from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def get_main_menu() -> ReplyKeyboardMarkup:
    buttons = [
        [KeyboardButton(text='📊 Ballarim'), KeyboardButton(text='🔗 Havola olish')],
        [KeyboardButton(text='ℹ️ Darslar haqida')]
    ]
    return ReplyKeyboardMarkup(
        keyboard=buttons,
        resize_keyboard=True
    )
