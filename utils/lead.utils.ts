
/** ✅ AI-Powered Lead Scoring */
export const calculateLeadScore = (engagementScore: number): number => {
    if (engagementScore > 80) return 100;
    if (engagementScore > 60) return 75;
    if (engagementScore > 40) return 50;
    if (engagementScore > 20) return 25;
    return 10; // Low-quality lead
  };
  