import React from 'react';

const statCards = [
  { title: 'Total Students', value: '1,245', color: 'bg-blue-500' },
  { title: 'Total Teachers', value: '84', color: 'bg-green-500' },
  { title: 'Classes', value: '42', color: 'bg-yellow-500' },
  { title: 'Exams This Month', value: '3', color: 'bg-purple-500' },
];

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 flex items-center">
            <div className={`w-12 h-12 ${stat.color} rounded-full flex-shrink-0 mr-4`}></div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Announcements</h3>
        <ul className="space-y-4">
          <li className="border-l-4 border-indigo-500 pl-4 py-1">
            <p className="text-sm font-medium text-gray-900">Term End Examinations</p>
            <p className="text-sm text-gray-500">Starting from next Monday. Please ensure all syllabuses are covered.</p>
          </li>
          <li className="border-l-4 border-green-500 pl-4 py-1">
            <p className="text-sm font-medium text-gray-900">Staff Meeting</p>
            <p className="text-sm text-gray-500">Scheduled for this Friday at 3:00 PM in the Main Hall.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
