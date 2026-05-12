import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from config import settings
from handlers import commands, menu_handlers, admin
from middlewares.subscription import SubscriptionMiddleware

async def main() -> None:
    # Initialize Bot instance
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )

    # Initialize Dispatcher
    dp = Dispatcher()

    # Register Middlewares
    dp.message.middleware(SubscriptionMiddleware())

    # Register routers
    dp.include_router(commands.router)
    dp.include_router(menu_handlers.router)
    dp.include_router(admin.router)

    # Filter out all previous updates and start polling
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped")
