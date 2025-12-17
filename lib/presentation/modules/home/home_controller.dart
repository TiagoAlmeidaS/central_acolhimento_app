import 'package:get/get.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../domain/entities/assisted.dart';
import '../../../../domain/entities/status.dart';
import '../../../../domain/usecases/assisted/get_assisted_list_usecase.dart';

class HomeController extends GetxController {
  final GetAssistedListUseCase getAssistedListUseCase =
      getIt<GetAssistedListUseCase>();

  final isLoading = false.obs;
  final assistedList = <Assisted>[].obs;
  final searchQuery = ''.obs;
  final selectedFilter = Rxn<AssistedStatus>();

  @override
  void onInit() {
    super.onInit();
    loadAssistedList();
  }

  Future<void> loadAssistedList() async {
    try {
      isLoading.value = true;
      final list = await getAssistedListUseCase(
        searchQuery: searchQuery.value.isEmpty ? null : searchQuery.value,
        statusFilter: selectedFilter.value,
      );
      assistedList.value = list;
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao carregar lista de assistidos');
    } finally {
      isLoading.value = false;
    }
  }

  void onSearchChanged(String query) {
    searchQuery.value = query;
    loadAssistedList();
  }

  void onFilterSelected(AssistedStatus? status) {
    selectedFilter.value = status;
    loadAssistedList();
  }
}

