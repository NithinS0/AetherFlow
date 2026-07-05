class RetryCalculator:
    @staticmethod
    def calculate_delay(
        policy_type: str,
        attempt: int,
        base_delay: int,
        multiplier: float = 2.0
    ) -> int:
        """
        Calculates delay in seconds for a specific attempt (1-indexed).
        """
        if attempt <= 0:
            return 0

        if policy_type == "fixed":
            return base_delay
        elif policy_type == "linear":
            return base_delay * attempt
        elif policy_type == "exponential":
            return int(base_delay * (multiplier ** (attempt - 1)))
        
        return base_delay
