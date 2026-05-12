from aiogram import Router, F
from aiogram.types import Message
from config import settings
from database.users import user_service

router = Router()

@router.message(F.text == '📊 Ballarim')
async def handle_my_points(message: Message):
    user = await user_service.get_user_by_telegram_id(message.from_user.id)
    if not user:
        return

    points_required = int(settings.points_required)
    points_left = max(0, points_required - user['points'])
    
    text = f"Sizning joriy ballaringiz: {user['points']}\n"
    
    if user['points'] >= points_required:
        escaped_link = settings.private_group_link.replace('_', '\\_')
        text += (
            f"\n✅ Tabriklaymiz! Siz maqsadga yetdingiz va darslarda qatnashish imkoniyatini qo'lga kiritdingiz.\n\n"
            f"Yopiq guruh havolasi: {escaped_link}"
        )
    else:
        text += f"Maqsadga yetish uchun yana {points_left} ta ball to'plashingiz kerak."
    
    await message.answer(text, parse_mode="Markdown")

@router.message(F.text == '🔗 Havola olish')
async def handle_get_link(message: Message):
    bot_info = await message.bot.get_me()
    referral_link = f"https://t.me/{bot_info.username}?start={message.from_user.id}"
    escaped_link = referral_link.replace('_', '\\_')
    
    text = (
        f"🩺 *Bepul EKG darslari*\n\n"
        f"Malakali kardiolog tomonidan olib boriladi.\n\n"
        f"1 hafta davomida EKG asoslaridan boshlab murakkab aritmiyalargacha o'rgatiladi.\n\n"
        f"Bepul darslarda qatnashish uchun kamida 5 ta do'stingizni taklif qilishingiz kerak bo'ladi.\n\n"
        f"Ro'yxatdan o'tish: {escaped_link}"
    )
    
    await message.answer(f"Sizning shaxsiy referal havolangiz:\n\n{referral_link}\n\nUshbu matnni nusxalab do'stlaringizga yuboring:")
    await message.answer(text, parse_mode="Markdown")

@router.message(F.text == 'ℹ️ Darslar haqida')
async def handle_about_course(message: Message):
    text = (
        f"ℹ️ *Darslar haqida*\n\n"
        f"Mavzu: EKG asoslari va aritmiyalar\n"
        f"Davomiyligi: 1 hafta\n"
        f"Format: Telegram kanal orqali bepul darslar\n\n"
        f"Ushbu darslar malakali kardiolog tomonidan olib boriladi va EKGni o'qish hamda tahlil qilishni o'rgatadi."
    )
    await message.answer(text, parse_mode="Markdown")
