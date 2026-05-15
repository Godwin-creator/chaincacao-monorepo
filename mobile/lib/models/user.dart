enum UserRole { producer, cooperative, processor, exporter, verifier, admin }

class UserProfile {
  final String id;
  final String fullName;
  final UserRole role;
  final String? phone;
  final String? organization;
  final String? region;
  final String? commune;
  final String? walletAddress;
  final DateTime? createdAt;

  UserProfile({
    required this.id,
    required this.fullName,
    required this.role,
    this.phone,
    this.organization,
    this.region,
    this.commune,
    this.walletAddress,
    this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      fullName: json['full_name'],
      role: UserRole.values.firstWhere((e) => e.name == json['role']),
      phone: json['phone'],
      organization: json['organization'],
      region: json['region'],
      commune: json['commune'],
      walletAddress: json['wallet_address'],
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'role': role.name,
      'phone': phone,
      'organization': organization,
      'region': region,
      'commune': commune,
      'wallet_address': walletAddress,
    };
  }
}

class ProducerDetails {
  final String id;
  final String userId;
  final String? cooperativeId;
  final int? familySize;
  final int? yearsExperience;
  final List<String> certifications;

  ProducerDetails({
    required this.id,
    required this.userId,
    this.cooperativeId,
    this.familySize,
    this.yearsExperience,
    this.certifications = const [],
  });

  factory ProducerDetails.fromJson(Map<String, dynamic> json) {
    return ProducerDetails(
      id: json['id'],
      userId: json['user_id'],
      cooperativeId: json['cooperative_id'],
      familySize: json['family_size'],
      yearsExperience: json['years_experience'],
      certifications: List<String>.from(json['certifications'] ?? []),
    );
  }
}
