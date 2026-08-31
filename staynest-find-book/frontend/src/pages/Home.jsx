import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  MapPinIcon,
  WifiIcon,
  AcademicCapIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { propertyService } from '../services/api';
import PropertyCard from '../components/student/PropertyCard';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll({ 
          isVerified: true,
          limit: 6,
          sort: '-averageRating'
        });
        setFeaturedProperties(response.data.data);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified by SGGS',
      description: 'All properties verified by SGGS Nanded admin for student safety',
    },
    {
      icon: HomeModernIcon,
      title: 'Near SGGS Campus',
      description: 'Find PGs and hostels near Vishnupuri, CIDCO and surrounding areas',
    },
    {
      icon: UserGroupIcon,
      title: 'SGGS Student Community',
      description: 'Connect with fellow SGGS students and trusted landlords',
    },
    {
      icon: StarIcon,
      title: 'Real Reviews from SGGS',
      description: 'Read genuine reviews from SGGS students who stayed there',
    },
  ];

  const stats = [
    { label: 'Properties near SGGS', value: '50+' },
    { label: 'SGGS Students Helped', value: '500+' },
    { label: 'Verified Landlords', value: '25+' },
    { label: 'Nearby Areas Covered', value: '8+' },
  ];

  return (
    <div>
      {/* ============================================
          HERO SECTION - SGGS OFF-CAMPUS STUDENTS
          ============================================ */}
      <section className="relative text-white py-20 min-h-[600px] flex items-center">
        {/* Background Image - College Campus with Students */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c7f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          {/* Dark Overlay with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/85 to-indigo-900/90"></div>
          
          {/* Bottom Pattern Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              {/* SGGS Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">SGGS Nanded • Off-Campus Housing</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Find Your Perfect 
                <span className="text-indigo-300"> PG Near SGGS</span>
              </h1>
              
              <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-lg">
                Discover verified PGs and hostels near SGGS Nanded. 
                Safe, affordable, and trusted by 500+ SGGS students.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search near Vishnupuri, CIDCO..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-white text-indigo-600 px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    Find PG Near SGGS
                  </button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-indigo-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Illustration/Image */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Main Image */}
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/images/sggs/clg.png"
                    alt="SGGS Students"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent"></div>
                </div>
                
                {/* Floating Badge 1 - Students */}
                <div className="absolute -top-4 -right-4 bg-white text-gray-900 rounded-xl shadow-lg p-4 max-w-[200px] animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <p className="font-bold text-sm">500+</p>
                      <p className="text-xs text-gray-500">SGGS Students</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 - Verified */}
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white rounded-xl shadow-lg p-4 max-w-[180px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-6 w-6" />
                    <div>
                      <p className="font-bold text-sm">Verified</p>
                      <p className="text-xs text-green-200">by SGGS Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Areas Near SGGS */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-700 mr-2">🏠 Popular areas near SGGS:</span>
            {['Vishnupuri', 'CIDCO', 'Taramandal', 'Kailash Nagar', 'Basti Bazar', 'Gurudwara Road'].map((area) => (
              <button
                key={area}
                onClick={() => {
                  setSearchQuery(area);
                  handleSearch(new Event('submit'));
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-full text-sm transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why SGGS Students Choose StayNest?
            </h2>
            <p className="text-gray-600 mt-2">Trusted platform for off-campus housing near SGGS Nanded</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top PGs Near SGGS Nanded</h2>
              <p className="text-gray-600 mt-2">Trusted by SGGS students for off-campus living</p>
            </div>
            <Link
              to="/properties"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
            >
              View All Near SGGS
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No properties near SGGS Nanded available yet</p>
              <p className="text-sm text-gray-500 mt-2">Check back later or register as a landlord to list your PG</p>
            </div>
          )}
        </div>
      </section>

      {/* SGGS CTA Section */}
      <section className="relative bg-indigo-600 text-white py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-10 w-10 mr-3" />
            <h2 className="text-3xl font-bold">
              SGGS Nanded Student Looking for PG?
            </h2>
          </div>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join 500+ SGGS students who found their perfect stay near Vishnupuri, CIDCO, and surrounding areas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Register as SGGS Student
            </Link>
            <Link
              to="/properties"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Near SGGS
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-indigo-200">
            <span>📍 Vishnupuri</span>
            <span>•</span>
            <span>📍 CIDCO</span>
            <span>•</span>
            <span>📍 Taramandal</span>
            <span>•</span>
            <span>📍 Kailash Nagar</span>
            <span>•</span>
            <span>📍 Basti Bazar</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;