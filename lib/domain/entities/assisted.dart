import 'package:equatable/equatable.dart';
import 'status.dart';

class Assisted extends Equatable {
  final String id;
  final String name;
  final String? photoUrl;
  final String phone;
  final String city;
  final String state;
  final AssistedStatus status;
  final DateTime? lastContact;
  final String? lastContactFormatted;

  const Assisted({
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

  @override
  List<Object?> get props => [
        id,
        name,
        photoUrl,
        phone,
        city,
        state,
        status,
        lastContact,
        lastContactFormatted,
      ];
}

