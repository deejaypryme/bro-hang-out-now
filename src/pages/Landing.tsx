
import React from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white">
              👊
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">BroYouFree</h1>
          </div>
          
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Turn "maybe later" into confirmed plans. Finally coordinate hangouts that actually happen.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Try the App
            </Button>
            <Button 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
