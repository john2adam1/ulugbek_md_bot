from aiogram import Router, F
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from config import settings
from database.users import user_service
from keyboards.menu import get_main_menu

router = Router()

async def is_subscribed(bot, user_id: int) -> bool:
    try:
        member = await bot.get_chat_member(chat_id=settings.channel_id, user_id=user_id)
        return member.status in ['member', 'administrator', 'creator']
    except Exception as e:
        print(f"Error checking sub: {e}")
        return False

@router.message(CommandStart())
async def command_start_handler(message: Message, command: CommandObject) -> None:
    telegram_id = message.from_user.id
    full_name = message.from_user.full_name
    username = message.from_user.username

    # Referral logic
    referrer_id = None
    if command.args and command.args.isdigit():
        referrer_id = int(command.args)
        if referrer_id == telegram_id:
            referrer_id = None

    user = await user_service.get_user_by_telegram_id(telegram_id)
    subscribed = await is_subscribed(message.bot, telegram_id)

    if not user:
        user = await user_service.create_user({
            "telegram_id": telegram_id,
            "full_name": full_name,
            "username": username,
            "invited_by": referrer_id,
            "points": 0,
            "is_winner": False,
            "is_point_given": False
        })

    # Award point if subscribed and invited
    if subscribed and user.get('invited_by') and not user.get('is_point_given'):
        referrer = await user_service.add_point(user['invited_by'])
        await user_service.mark_point_as_given(telegram_id)
        
        # Notify referrer
        try:
            await message.bot.send_message(
                user['invited_by'], 
                "Tabriklaymiz! Taklif qilgan do'stingiz kanalga a'zo bo'ldi. Sizga +1 ball berildi."
            )
            
            if referrer and referrer['points'] >= int(settings.points_required) and not referrer['is_winner']:
                await user_service.set_winner(user['invited_by'])
                success_msg = (
                    f"🎉 Tabriklaymiz! Siz muvaffaqiyatli {settings.points_required} ta ball to'pladingiz!\n\n"
                    f"Mana siz kutgan yopiq guruh havolasi:\n"
                    f"{settings.private_group_link}\n\n"
                    f"Guruhga a'zo bo'ling va darslarni kuting!"
                )
                await message.bot.send_message(user['invited_by'], success_msg)
        except:
            pass

    if not subscribed:
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📢 Kanalga a'zo bo'lish", url=settings.channel_url)],
            [InlineKeyboardButton(text="✅ Tekshirish", callback_data="check_sub")]
        ])
        await message.answer(
            f"Salom {full_name}! Botdan foydalanish va ball yig'ish uchun avval kanalimizga a'zo bo'ling:",
            reply_markup=keyboard
        )
        return

    await message.answer(
        f"Salom {full_name}! Seminar registratsiya botiga xush kelibsiz.\n\nPastdagi tugmalar orqali referal havolangizni oling va ball to'plashni boshlang!",
        reply_markup=get_main_menu()
    )

@router.callback_query(F.data == "check_sub")
async def check_sub_handler(callback: CallbackQuery, bot):
    await callback.answer()
    # We can just re-run the start handler logic by creating a dummy CommandObject if needed, 
    # but simpler is to just call a helper or the handler itself with empty args.
    # For simplicity, we just call the handler with no args.
    class DummyCommand:
        args = None
    await command_start_handler(callback.message, DummyCommand())
