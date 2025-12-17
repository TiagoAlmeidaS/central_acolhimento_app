import 'package:equatable/equatable.dart';

class Caregiver extends Equatable {
  final String? id;
  final String fullName;
  final String phone;
  final String state;
  final String city;
  final String churchLocation;
  final String? biography;
  final String? status; // pending, approved, rejected

  const Caregiver({
    this.id,
    required this.fullName,
    required this.phone,
    required this.state,
    required this.city,
    required this.churchLocation,
    this.biography,
    this.status,
  });

  @override
  List<Object?> get props => [
        id,
        fullName,
        phone,
        state,
        city,
        churchLocation,
        biography,
        status,
      ];
}

