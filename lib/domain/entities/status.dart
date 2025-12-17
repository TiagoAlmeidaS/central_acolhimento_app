enum AssistedStatus {
  urgent('Urgente'),
  waiting('Aguardando'),
  inProgress('Em Acompanhamento'),
  completed('Concluído');

  final String label;
  const AssistedStatus(this.label);
}

