import 'package:get/get.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../domain/entities/summary_metrics.dart';
import '../../../../domain/usecases/summary/get_summary_metrics_usecase.dart';

class SummaryController extends GetxController {
  final GetSummaryMetricsUseCase getSummaryMetricsUseCase =
      getIt<GetSummaryMetricsUseCase>();

  final isLoading = false.obs;
  final metrics = Rxn<SummaryMetrics>();

  @override
  void onInit() {
    super.onInit();
    loadMetrics();
  }

  Future<void> loadMetrics() async {
    try {
      isLoading.value = true;
      final data = await getSummaryMetricsUseCase();
      metrics.value = data;
    } catch (e) {
      Get.snackbar('Erro', 'Falha ao carregar métricas');
    } finally {
      isLoading.value = false;
    }
  }
}

