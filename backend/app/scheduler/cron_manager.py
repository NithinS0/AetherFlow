from datetime import datetime
import pytz
from croniter import croniter

class CronManager:
    @staticmethod
    def validate_cron(expression: str) -> bool:
        """
        Validates if expression is a valid standard 5-field cron.
        """
        try:
            return croniter.is_valid(expression)
        except Exception:
            return False

    @staticmethod
    def calculate_next_run(
        expression: str,
        timezone_name: str = "UTC",
        base_time: datetime = None
    ) -> datetime:
        """
        Calculates next run datetime matching cron expression and timezone.
        """
        if not base_time:
            base_time = datetime.utcnow()

        try:
            tz = pytz.timezone(timezone_name)
        except Exception:
            tz = pytz.UTC

        # Localize base time if needed or make sure it's timezone-aware
        if base_time.tzinfo is None:
            base_time_tz = pytz.UTC.localize(base_time).astimezone(tz)
        else:
            base_time_tz = base_time.astimezone(tz)

        iter_cron = croniter(expression, base_time_tz)
        next_run = iter_cron.get_next(datetime)
        
        # Convert back to UTC for standard database storage
        return next_run.astimezone(pytz.UTC).replace(tzinfo=None)
