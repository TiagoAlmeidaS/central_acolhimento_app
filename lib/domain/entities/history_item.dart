import 'package:equatable/equatable.dart';

enum HistoryType {
  aiInsight,
  caregiverAction,
  visit,
  other,
}

class HistoryItem extends Equatable {
  final String id;
  final HistoryType type;
  final String title;
  final String description;
  final String author;
  final DateTime? date;
  final String dateFormatted;

  const HistoryItem({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.author,
    this.date,
    required this.dateFormatted,
  });

  @override
  List<Object?> get props => [
        id,
        type,
        title,
        description,
        author,
        date,
        dateFormatted,
      ];
}

