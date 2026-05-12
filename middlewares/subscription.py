from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from config import settings

class SubscriptionMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any]
    ) -> Any:
        # Ignore non-messages and start command (start handler handles its own sub check)
        if not isinstance(event, Message) or (event.text and event.text.startswith('/start')):
            return await handler(event, data)

        user_id = event.from_user.id
        bot = data['bot']

        try:
            member = await bot.get_chat_member(chat_id=settings.channel_id, user_id=user_id)
            if member.status in ['member', 'administrator', 'creator']:
                return await handler(event, data)
            else:
                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="📢 Kanalga a'zo bo'lish", url=settings.channel_url)],
                    [InlineKeyboardButton(text="✅ Tekshirish", callback_data="check_sub")]
                ])
                await event.answer(
                    "Iltimos, botdan foydalanish uchun kanalimizga a'zo bo'ling:",
                    reply_markup=keyboard
                )
                return
        except Exception as e:
            print(f"Subscription check error: {e}")
            return await handler(event, data)
