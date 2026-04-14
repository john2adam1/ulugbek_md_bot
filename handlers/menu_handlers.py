from aiogram import Router, F
from aiogram.types import Message
from strings import STRINGS
from keyboards.inline import get_enroll_kb

router = Router()

@router.message(F.text == STRINGS["menu_about_me"])
async def about_me_handler(message: Message) -> None:
    await message.answer(STRINGS["about_me_text"], parse_mode="Markdown")

@router.message(F.text == STRINGS["menu_about_course"])
async def about_course_handler(message: Message) -> None:
    await message.answer(STRINGS["about_course_text"], parse_mode="Markdown")

@router.message(F.text == STRINGS["menu_free_lessons"])
async def free_lessons_handler(message: Message) -> None:
    await message.answer(STRINGS["free_lessons_text"], parse_mode="Markdown", disable_web_page_preview=False)

@router.message(F.text == STRINGS["menu_enroll"])
async def enroll_handler(message: Message) -> None:
    await message.answer(STRINGS["enroll_prompt"], reply_markup=get_enroll_kb())
