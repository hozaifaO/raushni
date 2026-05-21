'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Activity,
  Award,
  Briefcase,
  Mail,
  Newspaper,
  FolderKanban,
  Receipt,
  UserPlus,
  HandHeart,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue} from last month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ title, description, icon: Icon, href, color }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer block"
  >
    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`text-${color}-600`} size={24} />
    </div>
    <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </motion.a>
);

// Activity Item Component
const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`w-2 h-2 mt-2 rounded-full bg-${activity.color}-500`} />
    <div className="flex-1">
      <p className="text-sm text-gray-800">{activity.message}</p>
      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
    </div>
    {activity.status === 'pending' && <Clock size={14} className="text-yellow-500" />}
    {activity.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
    {activity.status === 'urgent' && <AlertCircle size={14} className="text-red-500" />}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBeneficiaries: 1247,
    totalDonations: 892,
    activeProjects: 12,
    totalVolunteers: 245,
    fundsRaised: 1250000,
    eventsHeld: 48
  });

  const [recentActivities, setRecentActivities] = useState([
    { message: 'New donation received from Mr. Rajesh Kumar', time: '5 minutes ago', status: 'completed', color: 'green' },
    { message: 'Beneficiary registration completed for 5 new families', time: '1 hour ago', status: 'completed', color: 'blue' },
    { message: 'Project "Education for All" milestone reached', time: '3 hours ago', status: 'completed', color: 'purple' },
    { message: 'Pending approval for new internship applications', time: '5 hours ago', status: 'pending', color: 'yellow' },
    { message: 'Event "Health Camp 2024" scheduled for next week', time: '1 day ago', status: 'urgent', color: 'red' },
  ]);

  const features = [
    { title: 'Member ID Card', description: 'Generate digital ID cards with QR codes', icon: FileText, href: '/member-id', color: 'blue' },
    { title: '80G Donation Receipt', description: 'Issue tax-deductible receipts instantly', icon: Receipt, href: '/donation-receipt', color: 'green' },
    { title: 'Appointment Letter', description: 'Automated offer letters for staff', icon: GraduationCap, href: '/appointment', color: 'purple' },
    { title: 'Achievement Certificate', description: 'Recognize volunteers and donors', icon: Award, href: '/certificate', color: 'orange' },
    { title: 'Beneficiary Management', description: 'Track and manage beneficiaries', icon: Users, href: '/beneficiaries', color: 'teal' },
    { title: 'Crowd Funding', description: 'Launch and manage campaigns', icon: TrendingUp, href: '/crowdfunding', color: 'pink' },
    { title: 'Internship Management', description: 'Handle intern applications', icon: Briefcase, href: '/internships', color: 'indigo' },
    { title: 'Donation Management', description: 'Track all donations', icon: Heart, href: '/donations', color: 'rose' },
    { title: 'Event Management', description: 'Organize and manage events', icon: Calendar, href: '/events', color: 'cyan' },
    { title: 'Project Management', description: 'Monitor project progress', icon: FolderKanban, href: '/projects', color: 'amber' },
    { title: 'News Management', description: 'Share updates and news', icon: Newspaper, href: '/dashboard/news', color: 'lime' },
    { title: 'Expense Management', description: 'Track NGO expenses', icon: DollarSign, href: '/expenses', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your NGO today.</p>
        </div>
      </div>

      <div className="px-4 pb-12 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard title="Beneficiaries" value={stats.totalBeneficiaries} icon={Users} color="blue" trend="up" trendValue="12%" />
          <StatCard title="Donations" value={stats.totalDonations} icon={Heart} color="red" trend="up" trendValue="8%" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={FolderKanban} color="green" trend="up" trendValue="2" />
          <StatCard title="Volunteers" value={stats.totalVolunteers} icon={UserPlus} color="purple" trend="up" trendValue="15%" />
          <StatCard title="Funds Raised" value={`₹${(stats.fundsRaised / 100000).toFixed(1)}L`} icon={TrendingUp} color="orange" trend="up" trendValue="23%" />
          <StatCard title="Events Held" value={stats.eventsHeld} icon={Calendar} color="teal" trend="up" trendValue="6" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-sm text-orange-600 hover:text-orange-700">View All</button>
            </div>
            <div className="space-y-1">
              {recentActivities.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </div>

          {/* Quick Stats / Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-center hover:from-blue-100 hover:to-blue-200 transition-all">
                <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-700">Add Beneficiary</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-center hover:from-green-100 hover:to-green-200 transition-all">
                <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-green-700">Record Donation</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg text-center hover:from-orange-100 hover:to-orange-200 transition-all">
                <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-orange-700">Generate Report</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-center hover:from-purple-100 hover:to-purple-200 transition-all">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-purple-700">Create Event</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg text-center hover:from-teal-100 hover:to-teal-200 transition-all">
                <HandHeart className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-teal-700">Start Campaign</p>
              </button>
              <button className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg text-center hover:from-pink-100 hover:to-pink-200 transition-all">
                <Mail className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-pink-700">View Enquiries</p>
              </button>
            </div>

            {/* Progress Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Annual Fundraising Goal</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style={{ width: '68%' }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">68%</span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>₹8.5L raised</span>
                <span>Goal: ₹12.5L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - All NGO Management Features */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Features</h2>
            <p className="text-sm text-gray-500">Complete NGO Management Suite</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
