import '../../../domain/entities/summary_metrics.dart';
import '../../../domain/repositories/summary_repository.dart';

class SummaryRepositoryImpl implements SummaryRepository {
  @override
  Future<SummaryMetrics> getSummaryMetrics() async {
    // TODO: Implementar busca real de métricas
    await Future.delayed(const Duration(milliseconds: 500));
    
    return const SummaryMetrics(
      totalCares: 50,
      newCares: 20,
      inProgressCares: 15,
      completedCares: 15,
      averageTime: '4h',
      statusDistribution: {
        'Novos': 20,
        'Em Andamento': 15,
        'Concluídos': 15,
      },
    );
  }
}

