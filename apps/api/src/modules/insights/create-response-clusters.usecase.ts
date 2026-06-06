export type AnalysisForCluster = {
  responseId: string;
  summary: string;
  sentiment: string;
  topics: string[];
};

export function createResponseClustersFromAnalyses(analyses: AnalysisForCluster[]) {
  const byTopic = new Map<string, AnalysisForCluster[]>();

  for (const analysis of analyses) {
    for (const topic of analysis.topics.length ? analysis.topics : ["General feedback"]) {
      const key = topic.trim() || "General feedback";
      byTopic.set(key, [...(byTopic.get(key) ?? []), analysis]);
    }
  }

  return [...byTopic.entries()].map(([topic, topicAnalyses]) => {
    const sentimentCounts = topicAnalyses.reduce<Record<string, number>>((counts, analysis) => {
      counts[analysis.sentiment] = (counts[analysis.sentiment] ?? 0) + 1;
      return counts;
    }, {});
    const sentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "mixed";

    return {
      name: topic,
      summary: `${topicAnalyses.length} response(s) mention ${topic}.`,
      sentiment: ["positive", "neutral", "negative", "mixed"].includes(sentiment) ? sentiment : "mixed",
      responseCount: topicAnalyses.length,
      representativeQuotes: topicAnalyses.slice(0, 3).map((analysis) => analysis.summary),
      recommendedAction: null,
    };
  });
}
