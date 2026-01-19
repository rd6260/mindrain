import React from 'react';
import { ArrowRight, Users, Plane } from 'lucide-react';

const TravelAgencyPage: React.FC = () => {
  return (
    <div className="min-h-screen text-[#000000] bg-[#EDEBDF] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-12 py-6 border-b border-gray-200">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-light">λ</div>
          <button className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs">🌐</span>
            English ▾
          </button>
        </div>
        
        <div className="flex items-center gap-8 text-sm">
          <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">About us</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Transfers</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Tours</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Contacts</a>
        </div>

        <button className="bg-[#5A6B4D] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#4A5B3D] transition-colors">
          Book a Tour
        </button>
      </nav>

      {/* Hero Section */}
      <div className="px-12 py-16">
        <div className="grid grid-cols-2 gap-8 items-start mb-12">
          <div>
            <h1 className="text-6xl font-light leading-tight mb-4">
              MindRain
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4 pt-8">
            <p className="text-sm text-gray-600 text-right max-w-xs">
              The most popular and trusted<br />travel agency in Greece
            </p>
            <button className="flex items-center gap-2 text-sm text-gray-700 border border-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              EXPLORE DESTINATIONS
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-80 rounded-2xl overflow-hidden mb-16">
          <img 
            src="https://i.pinimg.com/1200x/cc/4f/94/cc4f941c57d3077ba9a79550a9bf1405.jpg" 
            alt="Temple of Poseidon"
            className="w-full h-full object-cover"
          />
        </div>

        {/* About Section */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl overflow-hidden h-64">
            <img 
              src="https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&h=400&fit=crop" 
              alt="Ancient ruins"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col justify-center">
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-300"></span>
              ABOUT US
            </p>
            <h2 className="text-3xl font-light mb-4 leading-snug">
              The Highest Level of<br />Comfort, Convenience<br />and Service
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              At Armonia Excursions, we combine premium service with attention to detail. Whether it's a private tour to iconic landmarks, a tailored group experience, or a seamless transfer – we take care of everything, so you can enjoy every moment.
            </p>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:gap-3 transition-all w-fit">
              MORE ABOUT US
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h3 className="text-2xl font-light mb-8">Why Choose Us?</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                <Users size={24} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Professional team</h4>
                <p className="text-sm text-gray-600">
                  With years of experience in tourism, making sure you enjoy every moment.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                <Plane size={24} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Flexibility</h4>
                <p className="text-sm text-gray-600">
                  From historic landmarks to airports and ports – we take you where you need to go.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column Image */}
        <div className="mb-16 rounded-2xl overflow-hidden h-96">
          <img 
            src="https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&h=400&fit=crop" 
            alt="Ancient columns"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-300"></span>
            SERVICES
          </p>
          <h2 className="text-3xl font-light mb-4">What we offer?</h2>
          <p className="text-sm text-gray-600 mb-8 max-w-xl">
            From a private tour and a scheduled route to an accessible travel experience – we've got the perfect option for you.
          </p>

          <div className="grid grid-cols-3 gap-8">
            {/* Service Menu */}
            <div className="flex flex-col gap-2">
              <button className="bg-[#5A6B4D] text-white px-6 py-3 rounded-lg text-left text-sm hover:bg-[#4A5B3D] transition-colors">
                Private Tours
              </button>
              <button className="bg-white text-gray-700 px-6 py-3 rounded-lg text-left text-sm hover:bg-gray-50 transition-colors">
                Scheduled Tours
              </button>
              <button className="bg-white text-gray-700 px-6 py-3 rounded-lg text-left text-sm hover:bg-gray-50 transition-colors">
                Transfers
              </button>
              <button className="bg-white text-gray-700 px-6 py-3 rounded-lg text-left text-sm hover:bg-gray-50 transition-colors">
                Wheelchair Accessibility
              </button>
            </div>

            {/* Service Image */}
            <div className="rounded-2xl overflow-hidden h-64">
              <img 
                src="https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&h=400&fit=crop" 
                alt="Coastal sunset"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Service Details */}
            <div className="flex flex-col justify-center">
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-300"></span>
                AS YOU WISH
              </p>
              <h3 className="text-2xl font-light mb-4">
                Tailored <span className="italic">Private Tours</span><br />in Mercedes Vito
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Enjoy a customized journey? Travel in Mercedes Vito (6-seater, 8 clients + driver). These tours offer complete flexibility — visit as many or as few places as you'd like, at your own pace.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
                  <Users size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium">Perfect for those seeking</p>
                  <p className="text-xs text-gray-600">a fully personal experience</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-700 hover:gap-3 transition-all w-fit">
                EXPLORE TOURS
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelAgencyPage;
