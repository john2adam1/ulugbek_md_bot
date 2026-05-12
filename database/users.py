from supabase import create_client, Client
from config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

class UserService:
    @staticmethod
    async def get_user_by_telegram_id(telegram_id: int):
        response = supabase.table("users").select("*").eq("telegram_id", telegram_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    async def create_user(user_data: dict):
        response = supabase.table("users").insert(user_data).execute()
        return response.data[0] if response.data else None

    @staticmethod
    async def add_point(telegram_id: int):
        user = await UserService.get_user_by_telegram_id(telegram_id)
        if user:
            new_points = user['points'] + 1
            response = supabase.table("users").update({"points": new_points}).eq("telegram_id", telegram_id).execute()
            return response.data[0] if response.data else None
        return None

    @staticmethod
    async def mark_point_as_given(telegram_id: int):
        supabase.table("users").update({"is_point_given": True}).eq("telegram_id", telegram_id).execute()

    @staticmethod
    async def set_winner(telegram_id: int):
        supabase.table("users").update({"is_winner": True}).eq("telegram_id", telegram_id).execute()

    @staticmethod
    async def get_admin_stats():
        total_users = supabase.table("users").select("id", count="exact").execute().count
        total_winners = supabase.table("users").select("id", count="exact").eq("is_winner", True).execute().count
        return {"total_users": total_users, "total_winners": total_winners}

user_service = UserService()
