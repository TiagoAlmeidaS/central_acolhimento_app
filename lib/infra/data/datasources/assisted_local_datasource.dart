import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/assisted_model.dart';

abstract class AssistedLocalDataSource {
  Future<List<AssistedModel>> getAssistedList();
  Future<AssistedModel?> getAssistedById(String id);
  Future<void> cacheAssistedList(List<AssistedModel> assistedList);
}

class AssistedLocalDataSourceImpl implements AssistedLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const String _cacheKey = 'assisted_list_cache';

  AssistedLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<List<AssistedModel>> getAssistedList() async {
    final jsonString = sharedPreferences.getString(_cacheKey);
    if (jsonString == null) return [];

    final List<dynamic> jsonList = json.decode(jsonString);
    return jsonList
        .map((json) => AssistedModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<AssistedModel?> getAssistedById(String id) async {
    final list = await getAssistedList();
    try {
      return list.firstWhere((assisted) => assisted.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> cacheAssistedList(List<AssistedModel> assistedList) async {
    final jsonList = assistedList.map((assisted) => assisted.toJson()).toList();
    await sharedPreferences.setString(_cacheKey, json.encode(jsonList));
  }
}

