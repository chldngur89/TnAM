import React from 'react';
import { Link } from 'react-router';
import { Menu, AlertTriangle, TrendingUp, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function ManagerView() {
  // Mock data
  const weeklyAttendanceData = [
    { day: '월', 정상: 23, 지각: 2, 결근: 0 },
    { day: '화', 정상: 22, 지각: 3, 결근: 0 },
    { day: '수', 정상: 24, 지각: 1, 결근: 0 },
    { day: '목', 정상: 23, 지각: 2, 결근: 0 },
    { day: '금', 정상: 25, 지각: 0, 결근: 0 },
  ];

  const workHoursData = [
    { name: '김민수', 근무시간: 45, 초과근무: 5 },
    { name: '이영희', 근무시간: 42, 초과근무: 2 },
    { name: '박철수', 근무시간: 40, 초과근무: 0 },
    { name: '정수진', 근무시간: 48, 초과근무: 8 },
    { name: '최지훈', 근무시간: 44, 초과근무: 4 },
  ];

  const lateStatistics = [
    { name: '정시', value: 92, color: '#10b981' },
    { name: '지각', value: 8, color: '#f59e0b' },
  ];

  const teamMembers = [
    { name: '김민수', status: '근무중', clockIn: '08:59', clockOut: '-', late: false, overtime: 1.5 },
    { name: '이영희', status: '근무중', clockIn: '09:00', clockOut: '-', late: false, overtime: 0 },
    { name: '박철수', status: '퇴근', clockIn: '09:05', clockOut: '18:00', late: true, overtime: 0 },
    { name: '정수진', status: '근무중', clockIn: '08:55', clockOut: '-', late: false, overtime: 2.0 },
    { name: '최지훈', status: '휴가', clockIn: '-', clockOut: '-', late: false, overtime: 0 },
  ];

  const alerts = [
    { type: 'warning', user: '정수진', message: '이번 주 초과근무 8시간 초과' },
    { type: 'danger', user: '박철수', message: '이번 주 2회 지각' },
    { type: 'info', user: '김민수', message: '시간 정정 요청 대기 중' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-[#350d36] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5" />
          <h1 className="font-bold text-lg">출퇴근 관리자 대시보드</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm hover:underline">직원 뷰</Link>
          <Link to="/flow" className="text-sm hover:underline">플로우 다이어그램</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">25</span>
            </div>
            <p className="text-sm text-gray-600">전체 팀원</p>
            <p className="text-xs text-green-600 mt-1">↑ 1명 증가</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">23</span>
            </div>
            <p className="text-sm text-gray-600">오늘 출근</p>
            <p className="text-xs text-gray-500 mt-1">92% 출근율</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">2</span>
            </div>
            <p className="text-sm text-gray-600">오늘 지각</p>
            <p className="text-xs text-orange-600 mt-1">평균 15분 지각</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">12.5h</span>
            </div>
            <p className="text-sm text-gray-600">평균 초과근무</p>
            <p className="text-xs text-purple-600 mt-1">이번 주 누적</p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-gray-900">정책 위반 알림</h2>
            </div>
            <div className="space-y-2">
              {alerts.map((alert, index) => {
                const bgColors = {
                  warning: 'bg-orange-50 border-orange-200 text-orange-800',
                  danger: 'bg-red-50 border-red-200 text-red-800',
                  info: 'bg-blue-50 border-blue-200 text-blue-800'
                };
                return (
                  <div key={index} className={`p-3 rounded border ${bgColors[alert.type as keyof typeof bgColors]}`}>
                    <span className="font-semibold">{alert.user}</span> - {alert.message}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Weekly Attendance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-bold text-gray-900 mb-4">주간 출퇴근 현황</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="정상" fill="#10b981" />
                <Bar dataKey="지각" fill="#f59e0b" />
                <Bar dataKey="결근" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Work Hours Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-bold text-gray-900 mb-4">주간 근무 시간 (상위 5명)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workHoursData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={60} />
                <Tooltip />
                <Legend />
                <Bar dataKey="근무시간" fill="#3b82f6" />
                <Bar dataKey="초과근무" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Late Statistics Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">이번 주 지각 통계</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={lateStatistics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {lateStatistics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            총 125건 중 10건 지각 (8%)
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-bold text-gray-900 mb-4">팀원 출퇴근 현황</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">이름</th>
                  <th className="text-left p-3 font-semibold text-gray-700">상태</th>
                  <th className="text-left p-3 font-semibold text-gray-700">출근</th>
                  <th className="text-left p-3 font-semibold text-gray-700">퇴근</th>
                  <th className="text-left p-3 font-semibold text-gray-700">지각</th>
                  <th className="text-left p-3 font-semibold text-gray-700">초과근무</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{member.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        member.status === '근무중' ? 'bg-green-100 text-green-800' :
                        member.status === '퇴근' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{member.clockIn}</td>
                    <td className="p-3 text-gray-700">{member.clockOut}</td>
                    <td className="p-3">
                      {member.late ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </td>
                    <td className="p-3 text-gray-700">
                      {member.overtime > 0 ? (
                        <span className="text-orange-600 font-medium">{member.overtime}h</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
