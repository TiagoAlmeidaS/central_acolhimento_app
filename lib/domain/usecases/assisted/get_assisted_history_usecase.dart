import '../../entities/history_item.dart';
import '../../repositories/assisted_repository.dart';

class GetAssistedHistoryUseCase {
  final AssistedRepository repository;

  GetAssistedHistoryUseCase(this.repository);

  Future<List<HistoryItem>> call(String assistedId) async {
    return await repository.getAssistedHistory(assistedId);
  }
}

