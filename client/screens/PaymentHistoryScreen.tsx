import React from "react";
import { View, StyleSheet, FlatList, Pressable, Linking, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  billing_reason: string | null;
}

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  receipt_url: string | null;
  paid: boolean;
}

type PaymentItem = {
  type: 'invoice' | 'charge';
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  description: string;
  url: string | null;
};

export default function PaymentHistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { data, isLoading, error } = useQuery<{ invoices: Invoice[]; charges: Charge[] }>({
    queryKey: ['/api/payments/history'],
  });

  const formatCurrency = (amount: number, currency: string) => {
    const value = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return '#10B981';
      case 'pending':
      case 'processing':
        return '#F59E0B';
      case 'failed':
      case 'canceled':
        return '#EF4444';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Feather.glyphMap => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return 'check-circle';
      case 'pending':
      case 'processing':
        return 'clock';
      case 'failed':
      case 'canceled':
        return 'x-circle';
      default:
        return 'circle';
    }
  };

  const payments: PaymentItem[] = React.useMemo(() => {
    if (!data) return [];
    
    const items: PaymentItem[] = [];
    
    data.invoices.forEach((inv) => {
      items.push({
        type: 'invoice',
        id: inv.id,
        amount: inv.amount_paid || inv.amount_due,
        currency: inv.currency,
        status: inv.status,
        date: new Date(inv.created * 1000),
        description: inv.number ? `Invoice ${inv.number}` : 'Subscription Invoice',
        url: inv.hosted_invoice_url || inv.invoice_pdf,
      });
    });
    
    data.charges.forEach((ch) => {
      const hasMatchingInvoice = items.some(
        (item) => item.type === 'invoice' && Math.abs(item.amount - ch.amount) < 100 && 
        Math.abs(item.date.getTime() - new Date(ch.created * 1000).getTime()) < 86400000
      );
      if (!hasMatchingInvoice) {
        items.push({
          type: 'charge',
          id: ch.id,
          amount: ch.amount,
          currency: ch.currency,
          status: ch.paid ? 'paid' : ch.status,
          date: new Date(ch.created * 1000),
          description: ch.description || 'Payment',
          url: ch.receipt_url,
        });
      }
    });
    
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  const handleOpenUrl = async (url: string | null) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        console.error('Failed to open URL:', e);
      }
    }
  };

  const renderPayment = ({ item }: { item: PaymentItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.paymentCard,
        { backgroundColor: theme.backgroundDefault, opacity: pressed && item.url ? 0.8 : 1 },
      ]}
      onPress={() => handleOpenUrl(item.url)}
      disabled={!item.url}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <ThemedText style={styles.paymentDescription}>{item.description}</ThemedText>
          <ThemedText style={[styles.paymentDate, { color: theme.textSecondary }]}>
            {formatDate(item.date.getTime() / 1000)}
          </ThemedText>
        </View>
        <View style={styles.paymentAmount}>
          <ThemedText style={styles.amountText}>
            {formatCurrency(item.amount, item.currency)}
          </ThemedText>
          <View style={styles.statusContainer}>
            <Feather
              name={getStatusIcon(item.status)}
              size={14}
              color={getStatusColor(item.status)}
            />
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
      {item.url ? (
        <View style={styles.viewLinkContainer}>
          <ThemedText style={[styles.viewLink, { color: theme.primary }]}>
            {item.type === 'invoice' ? 'View Invoice' : 'View Receipt'}
          </ThemedText>
          <Feather name="external-link" size={12} color={theme.primary} />
        </View>
      ) : null}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading payment history...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
            Failed to load payment history
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="credit-card" size={64} color={theme.textSecondary} />
          <ThemedText style={styles.emptyTitle}>No Payment History</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your payment history will appear here once you subscribe to a plan.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderPayment}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <ThemedText style={styles.sectionTitle}>All Payments</ThemedText>
              <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {payments.length} transaction{payments.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  headerSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  paymentCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewLink: {
    fontSize: 13,
    fontWeight: '500',
  },
});
