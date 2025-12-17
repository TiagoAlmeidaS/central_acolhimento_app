import 'package:get/get.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../domain/entities/assisted.dart';
import '../../../../domain/entities/history_item.dart';
import '../../../../domain/usecases/assisted/get_assisted_details_usecase.dart';
import '../../../../domain/usecases/assisted/get_assisted_history_usecase.dart';

class DetailsController extends GetxController {
  final GetAssistedDetailsUseCase getAssistedDetailsUseCase =
      getIt<GetAssistedDetailsUseCase>();
  final GetAssistedHistoryUseCase getAssistedHistoryUseCase =
      getIt<GetAssistedHistoryUseCase>();

  final isLoading = false.obs;
  final assisted = Rxn<Assisted>();
  final historyList = <HistoryItem>[].obs;

  Future<void> loadAssistedDetails(String id) async {
    try {
      isLoading.value = true;
      final details = await getAssistedDetailsUseCase(id);
      assisted.value = details;
      await loadHistory(id);
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao carregar detalhes');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadHistory(String id) async {
    try {
      final history = await getAssistedHistoryUseCase(id);
      historyList.value = history;
    } catch (e) {
      // Ignore history errors
    }
  }
}

