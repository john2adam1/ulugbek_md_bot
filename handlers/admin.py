from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from config import settings
from database.users import user_service

router = Router()

@router.message(Command("admin"))
async def handle_admin(message: Message):
    user_id = message.from_user.id
    admin_ids = [int(id.strip()) for id in settings.admin_ids.split(',') if id.strip().isdigit()]
    
    if user_id not in admin_ids:
        await message.answer("Sizda ushbu komandani ishlatish uchun ruxsat yo'q.")
        return

    stats = await user_service.get_admin_stats()
    
    text = (
        f"📊 *Bot Statistikasi*\n\n"
        f"Umumiy ro'yxatdan o'tganlar: {stats['total_users']}\n"
        f"Seminarga yo'llanma olganlar: {stats['total_winners']}"
    )
    
    await message.answer(text, parse_mode="Markdown")
