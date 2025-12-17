import '../../../domain/entities/assisted.dart';
import '../../../domain/entities/history_item.dart';
import '../../../domain/entities/status.dart';
import '../../../domain/repositories/assisted_repository.dart';
import '../datasources/assisted_local_datasource.dart';
import '../datasources/assisted_remote_datasource.dart';

class AssistedRepositoryImpl implements AssistedRepository {
  final AssistedRemoteDataSource remoteDataSource;
  final AssistedLocalDataSource localDataSource;

  AssistedRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<List<Assisted>> getAssistedList({
    String? searchQuery,
    AssistedStatus? statusFilter,
  }) async {
    try {
      final assistedList = await remoteDataSource.getAssistedList();
      await localDataSource.cacheAssistedList(assistedList);

      var filteredList = assistedList.map((model) => model.toEntity()).toList();

      if (searchQuery != null && searchQuery.isNotEmpty) {
        filteredList = filteredList
            .where((assisted) =>
                assisted.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
                assisted.city.toLowerCase().contains(searchQuery.toLowerCase()))
            .toList();
      }

      if (statusFilter != null) {
        filteredList = filteredList
            .where((assisted) => assisted.status == statusFilter)
            .toList();
      }

      return filteredList;
    } catch (e) {
      // Fallback para cache local em caso de erro
      final cachedList = await localDataSource.getAssistedList();
      return cachedList.map((model) => model.toEntity()).toList();
    }
  }

  @override
  Future<Assisted> getAssistedById(String id) async {
    try {
      final model = await remoteDataSource.getAssistedById(id);
      return model.toEntity();
    } catch (e) {
      final cached = await localDataSource.getAssistedById(id);
      if (cached != null) return cached.toEntity();
      rethrow;
    }
  }

  @override
  Future<List<HistoryItem>> getAssistedHistory(String assistedId) async {
    // TODO: Implementar busca de histórico
    await Future.delayed(const Duration(milliseconds: 300));
    
    return [
      HistoryItem(
        id: '1',
        type: HistoryType.aiInsight,
        title: 'Resumo Semanal',
        description:
            'O assistido demonstrou melhora significativa no humor após a atividade em grupo.',
        author: 'IA',
        date: DateTime.now().subtract(const Duration(days: 14)),
        dateFormatted: '10 Out • 14:30',
      ),
      HistoryItem(
        id: '2',
        type: HistoryType.caregiverAction,
        title: 'Visita Domiciliar',
        description: 'Visita realizada com sucesso.',
        author: 'Maria (Cuidadora)',
        date: DateTime.now().subtract(const Duration(days: 19)),
        dateFormatted: '05 Out • 09:15',
      ),
    ];
  }

  @override
  Future<void> updateAssistedStatus(String id, AssistedStatus status) async {
    // TODO: Implementar atualização de status
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Future<void> createAssisted(Assisted assisted) async {
    // TODO: Implementar criação de assistido
    await Future.delayed(const Duration(milliseconds: 300));
  }
}

