import '../entities/summary_metrics.dart';

abstract class SummaryRepository {
  Future<SummaryMetrics> getSummaryMetrics();
}

