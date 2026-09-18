// Assigned module owner: IT25103724
package com.sliit.sims.exam.dto;

import java.util.List;
import java.util.Map;

public record ExamAnalyticsResponse(
        long evaluatedCandidates,
        int totalEntries,
        double batchAverage,
        double passRate,
        long passedCount,
        double highestAggregate,
        String topSubjectName,
        double topSubjectAverage,
        Map<String, Long> gradeDistribution,
        Map<String, Double> gradePercentages,
        Map<String, Double> subjectAverages,
        List<MeritEntry> meritList
) {
    public record MeritEntry(Long studentId, double totalMarks, double averageMarks, int rank) {}
}
