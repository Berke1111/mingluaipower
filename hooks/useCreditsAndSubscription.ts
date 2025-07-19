import { useEffect, useState } from "react";
export function useCreditsAndSubscription() {
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/user-credits")
      .then(res => res.json())
      .then(data => {
        setCredits(data.credits);
        setSubscriptionActive(data.subscriptionActive);
      });
  }, []);

  return { credits, subscriptionActive };
} 