import '../../../domain/entities/assisted.dart';
import '../../../domain/entities/status.dart';

class AssistedModel {
  final String id;
  final String name;
  final String? photoUrl;
  final String phone;
  final String city;
  final String state;
  final AssistedStatus status;
  final DateTime? lastContact;
  final String? lastContactFormatted;

  const AssistedModel({
    required this.id,
    required this.name,
    this.photoUrl,
    required this.phone,
    required this.city,
    required this.state,
    required this.status,
    this.lastContact,
    this.lastContactFormatted,
  });

  Assisted toEntity() {
    return Assisted(
      id: id,
      name: name,
      photoUrl: photoUrl,
      phone: phone,
      city: city,
      state: state,
      status: status,
      lastContact: lastContact,
      lastContactFormatted: lastContactFormatted,
    );
  }

  factory AssistedModel.fromJson(Map<String, dynamic> json) {
    return AssistedModel(
      id: json['id'] as String,
      name: json['name'] as String,
      photoUrl: json['photoUrl'] as String?,
      phone: json['phone'] as String,
      city: json['city'] as String,
      state: json['state'] as String,
      status: _statusFromString(json['status'] as String),
      lastContact: json['lastContact'] != null
          ? DateTime.parse(json['lastContact'] as String)
          : null,
      lastContactFormatted: json['lastContactFormatted'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'photoUrl': photoUrl,
      'phone': phone,
      'city': city,
      'state': state,
      'status': status.label,
      'lastContact': lastContact?.toIso8601String(),
      'lastContactFormatted': lastContactFormatted,
    };
  }

  static AssistedStatus _statusFromString(String status) {
    switch (status.toLowerCase()) {
      case 'urgente':
        return AssistedStatus.urgent;
      case 'aguardando':
        return AssistedStatus.waiting;
      case 'em acompanhamento':
        return AssistedStatus.inProgress;
      case 'concluído':
        return AssistedStatus.completed;
      default:
        return AssistedStatus.waiting;
    }
  }
}

