from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    bot_token: str = Field(..., alias="BOT_TOKEN")
    manager_username: str = Field(..., alias="MANAGER_USERNAME")
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(..., alias="SUPABASE_SERVICE_ROLE_KEY")
    channel_id: str = Field(..., alias="CHANNEL_ID")
    admin_ids: str = Field(..., alias="ADMIN_IDS")
    private_group_link: str = Field(..., alias="PRIVATE_GROUP_LINK")
    channel_url: str = Field("https://t.me/Ulugbek_Zaylobidinov", alias="CHANNEL_URL")
    points_required: int = Field(5, alias="POINTS_REQUIRED")

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
