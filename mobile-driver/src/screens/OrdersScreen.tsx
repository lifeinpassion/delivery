import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { driverAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (user?.driverId) {
        const response = await driverAPI.getMyOrders(user.driverId);
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      ASSIGNED: '#3b82f6',
      PICKED_UP: '#8b5cf6',
      IN_TRANSIT: '#6366f1',
      DELIVERED: '#22c55e',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const renderOrderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.orderDetail}>
        From: {item.pickupAddress.street}, {item.pickupAddress.city}
      </Text>
      <Text style={styles.orderDetail}>
        To: {item.dropoffAddress.street}, {item.dropoffAddress.city}
      </Text>
      <Text style={styles.orderPrice}>P{item.estimatedPrice.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Deliveries</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No deliveries yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0ea5e9',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
  },
});
