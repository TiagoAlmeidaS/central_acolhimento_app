import '../../entities/assisted.dart';
import '../../repositories/assisted_repository.dart';

class GetAssistedDetailsUseCase {
  final AssistedRepository repository;

  GetAssistedDetailsUseCase(this.repository);

  Future<Assisted> call(String id) async {
    return await repository.getAssistedById(id);
  }
}

