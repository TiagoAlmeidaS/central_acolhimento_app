import 'package:dio/dio.dart';
import '../../../domain/entities/status.dart';
import '../models/assisted_model.dart';

abstract class AssistedRemoteDataSource {
  Future<List<AssistedModel>> getAssistedList();
  Future<AssistedModel> getAssistedById(String id);
}

class AssistedRemoteDataSourceImpl implements AssistedRemoteDataSource {
  final Dio dio;

  AssistedRemoteDataSourceImpl(this.dio);

  @override
  Future<List<AssistedModel>> getAssistedList() async {
    // TODO: Implementar chamada real à API
    // Por enquanto retorna dados mockados
    await Future.delayed(const Duration(milliseconds: 500));
    
    return [
      AssistedModel(
        id: '1',
        name: 'Carlos Silva',
        photoUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCOUS_E-XNRzCMx6fdVpZo2LogjVHzd01WwQsYWnmU49V1M0ROpYFp2OgptGYXV2k8_VKbBoqVUVGKoH1D84M9ZpmUz9-GHXpE9ajZGpuGLylnuegZFJJ4Dw6HkkyicQ5n8Pdf9hppdHmmgTFfeZJFRmxIfEpjbTysTEz4svNGtVa2_S5CY50w_aikd7bjWDc-_HBvV55VAgO-5ROmAzeFxnIY9U07UxfJ7lqCYLuvJJmb5bJzrrFRTT_VBUUADQecrg4Eh-wiyzZ-r',
        phone: '(11) 99888-7766',
        city: 'São Paulo',
        state: 'SP',
        status: AssistedStatus.urgent,
        lastContactFormatted: '2 horas atrás',
      ),
      AssistedModel(
        id: '2',
        name: 'Ana Souza',
        photoUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCCAY_Y_bveKb4VS3iJzrEp1ol08kz9BBXqm9P3Z9ImTo7sY9s6DVS4w2Mb_yd0TX9CXcbyJtDE_vj-f96XOBltQO1lxdyFQSSU1dJLts5uHU9C1XJv6O4aoCJm-ozY-YL1_7G75rs8QJ40ctL3mUI3hSbMG_htQPGI5v7hZsZNBu1WbOj0iJTSNoBxhxta7qg5l-CBBYSMcjDfisFxqbxAERp-ymWHcMbr2Phflvc45Z0XrZkkeQISf3WxzDkMl6riEV4QljL2ns36',
        phone: '(19) 98765-4321',
        city: 'Campinas',
        state: 'SP',
        status: AssistedStatus.inProgress,
        lastContactFormatted: '15/10/2023',
      ),
      AssistedModel(
        id: '3',
        name: 'Roberto Mendes',
        phone: '(11) 91234-5678',
        city: 'Osasco',
        state: 'SP',
        status: AssistedStatus.waiting,
      ),
    ];
  }

  @override
  Future<AssistedModel> getAssistedById(String id) async {
    // TODO: Implementar chamada real à API
    await Future.delayed(const Duration(milliseconds: 300));
    
    return AssistedModel(
      id: id,
      name: 'João da Silva',
      photoUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuChYd_sMqkazpJZ0Blec_92aSSEXB8-cjC6BjSYxxiqtO9lDXHYHi454CK2xFMqJFke1K59-BLWE7N99BlMxzd2Dc14VMnOG0LgRolb3Kb80M-vCanavWwKt_sTZ64sxKpRDF2iQJu5Ju9vDqFIy5RrLrZNOYD4GAF6diuFTLyuA8O6_wX1bdMjolmUDQ9PbTaVXIU_Suq1hdXOVhcHWdcgMq824ag0cVla_ohb_Es3omFgeC7uIUiC9h8t6thoy-IqMVGoQR_q04JK',
      phone: '(11) 99888-7766',
      city: 'São Paulo',
      state: 'SP',
      status: AssistedStatus.inProgress,
    );
  }
}

