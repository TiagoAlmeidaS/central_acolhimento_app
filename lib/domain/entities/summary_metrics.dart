import 'package:equatable/equatable.dart';

class SummaryMetrics extends Equatable {
  final int totalCares;
  final int newCares;
  final int inProgressCares;
  final int completedCares;
  final String averageTime;
  final Map<String, int> statusDistribution;

  const SummaryMetrics({
    required this.totalCares,
    required this.newCares,
    required this.inProgressCares,
    required this.completedCares,
    required this.averageTime,
    required this.statusDistribution,
  });

  @override
  List<Object?> get props => [
        totalCares,
        newCares,
        inProgressCares,
        completedCares,
        averageTime,
        statusDistribution,
      ];
}

