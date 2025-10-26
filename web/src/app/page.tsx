'use client';

import Link from 'next/link';
import { Package, Truck, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Botswana Courier</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fast, Reliable Delivery Service
            <br />
            <span className="text-primary-600">Across Botswana</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional courier platform connecting customers with reliable drivers.
            Real-time tracking, instant notifications, and secure deliveries.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/about" className="btn btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book deliveries in seconds through our web or mobile app
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Truck className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Track your package every step of the way with live GPS updates
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Drivers</h3>
            <p className="text-gray-600">
              All drivers are background-checked and professionally trained
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Delivery</h3>
            <p className="text-gray-600">
              Digital proof of delivery with signature and photo verification
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Order</h3>
              <p className="text-gray-600">
                Enter pickup and delivery addresses, package details, and schedule
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Driver Assigned</h3>
              <p className="text-gray-600">
                A nearby driver accepts your order and heads to pickup location
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Receive</h3>
              <p className="text-gray-600">
                Monitor delivery in real-time and receive your package safely
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start delivering?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers using Botswana Courier
          </p>
          <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 inline-block">
            Sign Up Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">Botswana Courier</span>
            </div>
            <p className="text-gray-400">
              Professional delivery management platform for Botswana
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              &copy; 2025 Botswana Courier. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
