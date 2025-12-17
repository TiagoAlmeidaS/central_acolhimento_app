import '../../entities/summary_metrics.dart';
import '../../repositories/summary_repository.dart';

class GetSummaryMetricsUseCase {
  final SummaryRepository repository;

  GetSummaryMetricsUseCase(this.repository);

  Future<SummaryMetrics> call() async {
    return await repository.getSummaryMetrics();
  }
}

