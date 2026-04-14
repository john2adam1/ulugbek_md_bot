from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message
from strings import STRINGS
from keyboards.menu import get_main_menu

router = Router()

@router.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    await message.answer(
        STRINGS["welcome"],
        reply_markup=get_main_menu()
    )
