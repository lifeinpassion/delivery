'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/utils/api';
import { Package, MapPin, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll({ page: 1, limit: 10 });
      const orderData = response.data.orders;
      setOrders(orderData);

      // Calculate stats
      setStats({
        total: orderData.length,
        pending: orderData.filter((o: any) => o.status === 'PENDING').length,
        inProgress: orderData.filter((o: any) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(o.status)).length,
        delivered: orderData.filter((o: any) => o.status === 'DELIVERED').length,
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Botswana Courier</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.firstName}
              </span>
              <Link href="/customer/new-order" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2 inline" />
                New Order
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <MapPin className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <Package className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link href="/customer/orders" className="text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No orders yet</p>
              <Link href="/customer/new-order" className="btn btn-primary">
                Create Your First Order
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          #{order.orderNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        From: {order.pickupAddress.street}, {order.pickupAddress.city}
                      </p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        To: {order.dropoffAddress.street}, {order.dropoffAddress.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        P{order.estimatedPrice.toFixed(2)}
                      </p>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
