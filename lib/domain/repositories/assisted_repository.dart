import '../entities/assisted.dart';
import '../entities/history_item.dart';
import '../entities/status.dart';

abstract class AssistedRepository {
  Future<List<Assisted>> getAssistedList({
    String? searchQuery,
    AssistedStatus? statusFilter,
  });
  Future<Assisted> getAssistedById(String id);
  Future<List<HistoryItem>> getAssistedHistory(String assistedId);
  Future<void> updateAssistedStatus(String id, AssistedStatus status);
  Future<void> createAssisted(Assisted assisted);
}

