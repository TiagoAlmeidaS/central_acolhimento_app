import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/repositories/assisted_repository.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/summary_repository.dart';
import '../../domain/usecases/assisted/get_assisted_details_usecase.dart';
import '../../domain/usecases/assisted/get_assisted_history_usecase.dart';
import '../../domain/usecases/assisted/get_assisted_list_usecase.dart';
import '../../domain/usecases/auth/login_usecase.dart';
import '../../domain/usecases/auth/register_usecase.dart';
import '../../domain/usecases/summary/get_summary_metrics_usecase.dart';
import '../../infra/data/datasources/assisted_local_datasource.dart';
import '../../infra/data/datasources/assisted_remote_datasource.dart';
import '../../infra/data/repositories/assisted_repository_impl.dart';
import '../../infra/data/repositories/auth_repository_impl.dart';
import '../../infra/data/repositories/summary_repository_impl.dart';

final getIt = GetIt.instance;

Future<void> setupDependencyInjection() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

  final dio = Dio();
  getIt.registerLazySingleton<Dio>(() => dio);

  // DataSources
  getIt.registerLazySingleton<AssistedLocalDataSource>(
    () => AssistedLocalDataSourceImpl(getIt()),
  );

  getIt.registerLazySingleton<AssistedRemoteDataSource>(
    () => AssistedRemoteDataSourceImpl(getIt()),
  );

  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(getIt()),
  );

  getIt.registerLazySingleton<AssistedRepository>(
    () => AssistedRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
    ),
  );

  getIt.registerLazySingleton<SummaryRepository>(
    () => SummaryRepositoryImpl(),
  );

  // UseCases
  getIt.registerLazySingleton<LoginUseCase>(
    () => LoginUseCase(getIt()),
  );

  getIt.registerLazySingleton<RegisterUseCase>(
    () => RegisterUseCase(getIt()),
  );

  getIt.registerLazySingleton<GetAssistedListUseCase>(
    () => GetAssistedListUseCase(getIt()),
  );

  getIt.registerLazySingleton<GetAssistedDetailsUseCase>(
    () => GetAssistedDetailsUseCase(getIt()),
  );

  getIt.registerLazySingleton<GetAssistedHistoryUseCase>(
    () => GetAssistedHistoryUseCase(getIt()),
  );

  getIt.registerLazySingleton<GetSummaryMetricsUseCase>(
    () => GetSummaryMetricsUseCase(getIt()),
  );
}

