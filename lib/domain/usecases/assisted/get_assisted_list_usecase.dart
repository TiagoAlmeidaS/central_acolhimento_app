import '../../entities/assisted.dart';
import '../../entities/status.dart';
import '../../repositories/assisted_repository.dart';

class GetAssistedListUseCase {
  final AssistedRepository repository;

  GetAssistedListUseCase(this.repository);

  Future<List<Assisted>> call({
    String? searchQuery,
    AssistedStatus? statusFilter,
  }) async {
    return await repository.getAssistedList(
      searchQuery: searchQuery,
      statusFilter: statusFilter,
    );
  }
}

