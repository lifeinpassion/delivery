import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { driverAPI } from '../services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const { location, startTracking, stopTracking, isTracking } = useLocation();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [driverStatus, setDriverStatus] = useState('OFFLINE');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (driverStatus === 'AVAILABLE') {
      fetchAvailableOrders();
    }
  }, [driverStatus]);

  const fetchAvailableOrders = async () => {
    try {
      const response = await driverAPI.getAvailableOrders();
      setAvailableOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = driverStatus === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';

      await driverAPI.updateStatus(newStatus);
      setDriverStatus(newStatus);

      if (newStatus === 'AVAILABLE') {
        await startTracking();
        Alert.alert('Success', 'You are now online and available for orders');
      } else {
        stopTracking();
        Alert.alert('Success', 'You are now offline');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await driverAPI.acceptOrder(orderId);
      Alert.alert('Success', 'Order accepted! Check your orders tab for details.');
      fetchAvailableOrders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept order');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableOrders();
    setRefreshing(false);
  };

  const renderOrderItem = ({ item }: any) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
      <Text style={styles.orderDetail}>
        Pickup: {item.pickupAddress.street}, {item.pickupAddress.city}
      </Text>
      <Text style={styles.orderDetail}>
        Dropoff: {item.dropoffAddress.street}, {item.dropoffAddress.city}
      </Text>
      <Text style={styles.orderPrice}>P{item.estimatedPrice.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptOrder(item.id)}
      >
        <Text style={styles.acceptButtonText}>Accept Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {user?.firstName}!</Text>
        <TouchableOpacity
          style={[
            styles.statusButton,
            driverStatus === 'AVAILABLE' && styles.statusButtonActive,
          ]}
          onPress={handleStatusToggle}
        >
          <Text style={styles.statusButtonText}>
            {driverStatus === 'OFFLINE' ? 'Go Online' : 'Go Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {driverStatus === 'AVAILABLE' ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Available Orders</Text>
          <FlatList
            data={availableOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No orders available</Text>
                <Text style={styles.emptySubtext}>
                  New orders will appear here when they're assigned
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.offlineState}>
          <Text style={styles.offlineText}>You are currently offline</Text>
          <Text style={styles.offlineSubtext}>
            Go online to start receiving delivery requests
          </Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  statusButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#22c55e',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
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
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  orderDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginTop: 8,
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  offlineState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  offlineText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  offlineSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
