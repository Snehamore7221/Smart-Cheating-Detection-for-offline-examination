from typing import Dict, Optional, Tuple
from alerts.alert_model import Alert

class AlertManager:
    """
    Alert Cooldown and Debouncing Manager (Stub for future detection stages).
    Prevents repeated alerts for continuous activity on the same bench.
    """

    def __init__(self, cooldown_seconds: float = 10.0):
        self.cooldown_seconds = cooldown_seconds
        # Key: (bench_id, activity_type) -> last_triggered_timestamp_seconds
        self.recent_alerts: Dict[Tuple[str, str], float] = {}

    def should_trigger_alert(self, bench_id: str, activity_type: str, current_time_seconds: float) -> bool:
        """
        Returns True if cooldown window has elapsed for (bench_id, activity_type).
        """
        key = (bench_id, activity_type)
        last_time = self.recent_alerts.get(key)

        if last_time is None or (current_time_seconds - last_time) >= self.cooldown_seconds:
            self.recent_alerts[key] = current_time_seconds
            return True
        return False

    def reset_cooldowns(self):
        """Clears active cooldown timers."""
        self.recent_alerts.clear()
