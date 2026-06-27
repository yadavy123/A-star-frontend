import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CheckCircle, Clock, Globe, MessageSquare, TrendingUp, Star, Quote, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import DemoForm from '../components/DemoForm';
import 'swiper/css';
import 'swiper/css/pagination';
import { Slider } from './slider';
// import Neha from '../assets/Neha.jpg';
// import RohitGupta from '../assets/Rohit-Gupta.jpg';

import { getApprovedTestimonials } from '../api/api/testimonialApi.js';

type HomeTestimonial = {
  id: string;
  _id?: string;
  name: string;
  reviewerName?: string;
  text?: string;
  quote?: string;
  message?: string;
  content?: string;
  subject?: string;
  achievement?: string;
  primary?: boolean;
  rating?: number;
};

const Home = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [homeTestimonials, setHomeTestimonials] = useState<HomeTestimonial[]>([]);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testimonialData = await getApprovedTestimonials();
        const testimonialList: HomeTestimonial[] = testimonialData?.content || (Array.isArray(testimonialData) ? testimonialData : []);
        // Sort: primary first, then rest
        testimonialList.sort((a, b) => {
          if (a.primary && b.primary) return 0;
          if (a.primary) return -1;
          if (b.primary) return 1;
          return 0;
        });
        setHomeTestimonials(testimonialList.slice(0, 10));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Expert Faculty",
      description: "10,000+ hours of combined teaching experience with proven A*/A grade outcomes across all subjects."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Structured Syllabus",
      description: "Comprehensive weekly plans perfectly mapped to Cambridge IGCSE & AS/A Level curriculum requirements."
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Exam Readiness",
      description: "Regular topic tests, extensive past paper practice, checkpoints, and targeted revision sessions."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: "Personalized Support",
      description: "Small batch sizes with dedicated 1:1 doubt clearing sessions and individualized attention."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Parent Updates",
      description: "Regular progress reports, goal tracking, and transparent communication with parents."
    }
  ];

  const subjects = [
    { name: 'Physics', slug: 'physics', level: 'IGCSE & AS/A Level', color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400' },
    { name: 'Chemistry', slug: 'chemistry', level: 'IGCSE & AS/A Level', color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1532187875605-186c7131ef53?auto=format&fit=crop&q=80&w=400' },
    { name: 'Mathematics', slug: 'math', level: 'IGCSE & AS/A Level', color: 'bg-purple-500', image: 'https://images.unsplash.com/photo-1509228468518-180dd48a542f?auto=format&fit=crop&q=80&w=400' },
    { name: 'Economics', slug: 'economics', level: 'IGCSE & AS/A Level', color: 'bg-orange-500', image: 'https://images.unsplash.com/photo-1454165833767-027508496b4c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Biology', slug: 'biology', level: 'IGCSE & AS/A Level', color: 'bg-teal-500', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400' },
    { name: 'Further Math', slug: 'further-math', level: 'IGCSE & AS/A Level', color: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Languages', slug: 'languages', level: 'IGCSE & AS/A Level', color: 'bg-pink-500', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' }
  ];

  const steps = [
    {
      number: "01",
      title: "Diagnostic Assessment",
      description: "Comprehensive evaluation to understand current level and create personalized learning plan"
    },
    {
      number: "02",
      title: "Live Interactive Classes",
      description: "Small batch sessions with expert faculty using modern teaching methodologies"
    },
    {
      number: "03",
      title: "Practice & Feedback",
      description: "Regular assignments, topic tests, and detailed feedback for continuous improvement"
    },
    {
      number: "04",
      title: "Mock Examinations",
      description: "Timed practice exams with detailed analysis and performance tracking"
    },
    {
      number: "05",
      title: "Final Exam Sprint",
      description: "Intensive revision sessions and last-minute preparation for board examinations"
    }
  ];




  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-10">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Hero Text */}
            <div className="text-left">
              <h1 className="font-sans font-bold text-[1.2rem] md:text-[1.6rem] lg:text-[2rem] leading-tight mb-3 tracking-tight text-white">
                IGCSE &amp; AS/A Level Mastery
                <span className="block font-semibold text-yellow-400 text-[0.95rem] md:text-[1.1rem] lg:text-[1.2rem] mt-1 tracking-normal">
                  From First Principles to Top Scores
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-200 mb-4 leading-normal max-w-md">
                Live, interactive classes by expert faculty. Personalized doubt-clearing, proven exam strategies, and comprehensive past-paper practice to ensure your academic success.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-center"
                >
                  Book a Free Demo Class
                </button>
                <button
                  onClick={() => window.open('https://wa.me/918073982848', '_blank')}
                  className="border border-white hover:bg-white hover:text-black px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-center"
                >
                  WhatsApp Us
                </button>
              </div>
              {/* Stats */}
              <div className="mt-8 overflow-x-auto py-2">
                <div className="flex min-w-full gap-4 sm:justify-center sm:min-w-0">
                  <div className="min-w-[140px] shrink-0 text-center">
                    <div className="text-lg font-bold text-yellow-400">95%</div>
                    <div className="text-xs text-gray-300">A*/A Grades</div>
                  </div>
                  <div className="min-w-[140px] shrink-0 text-center border-l border-r border-yellow-400 border-opacity-30 px-4">
                    <div className="text-lg font-bold text-yellow-400">500+</div>
                    <div className="text-xs text-gray-300">Students Taught</div>
                  </div>
                  <div className="min-w-[140px] shrink-0 text-center">
                    <div className="text-lg font-bold text-yellow-400">8+</div>
                    <div className="text-xs text-gray-300">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Swiper Slider */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <Slider />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why A Star Classes */}
      <section className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose A Star Classes?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine expert teaching with proven methodologies to deliver exceptional results for every student.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:border-blue-500">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects & Tracks */}
      <section className="py-10 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Subject Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert coaching across all major IGCSE and AS/A Level subjects with specialized test preparation.
            </p>
          </div>

          {/* IGCSE & AS/A Level Subjects */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">IGCSE & AS/A Level Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjects.map((subject, index) => (
                <Link
                  key={index}
                  to={`/igcse/${subject.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 p-6 flex flex-col items-center justify-center"
                >
                  <div className={`w-16 h-16 ${subject.color} rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">{subject.name}</h4>
                    <p className="text-xs text-gray-600">{subject.level}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Standardized Tests */}
          {/* <div className="bg-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Standardized Test Preparation</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {['SAT', 'AP', 'AMC', 'TMUA', 'ACT'].map((test, index) => (
                <Link
                  key={index}
                  to={`/sat-prep/${test.toLowerCase()}`}
                  className="bg-white rounded-xl p-6 text-center border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{test}</h4>
                </Link>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      {/* Results & Proof */}
      <section className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proven Track Record of Excellence
            </h2>
            <p className="text-xl text-gray-600">
              Our students consistently achieve top grades and secure admissions to prestigious universities worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-700">Students Score A*/A</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-700">Students Guided</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-700">Top Universities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-orange-600 mb-2">8+</div>
              <div className="text-gray-700">Years Experience</div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
              <Globe className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Global Recognition</h4>
              <p className="text-blue-100">Students admitted to top universities across UK, US, Canada, and Australia</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Perfect Scores</h4>
              <p className="text-green-100">Multiple students achieved maximum marks in various subjects</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Grade Improvement</h4>
              <p className="text-purple-100">Average improvement of 2+ grades within one academic year</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Classes Work */}
      <section className="py-10 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Proven Learning Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A systematic approach designed to maximize learning outcomes and exam performance.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      {homeTestimonials.length > 0 && (
        <section className="py-10 md:py-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Star className="h-3.5 w-3.5 fill-indigo-700" />
                Student Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from real students who achieved their academic goals with us.
              </p>
            </div>

            {/* Primary Testimonial - Top Center */}
            {homeTestimonials.filter(t => t.primary).slice(0, 1).map((t, idx) => {
              const testimonialText = t.text || t.quote || t.message || '';
              const studentName = t.name || t.reviewerName || 'Student';
              return (
                <div key={t.id || t._id || idx} className="flex justify-center mb-10">
                  <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-yellow-50 shadow-xl border-2 border-yellow-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
                    <div className="pt-8 pb-6 px-8 flex flex-col items-center text-center">
                      <div className="inline-flex items-center gap-1.5 bg-yellow-200 text-yellow-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-900" />
                        Featured Story
                      </div>
                      <div className="text-yellow-400 mb-3">
                        <Quote className="h-10 w-10 mx-auto" />
                      </div>
                      <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-5 font-semibold italic max-w-2xl mx-auto">
                        &ldquo;{testimonialText}&rdquo;
                      </p>
                      <div>
                        <p className="font-bold text-gray-900">{studentName}</p>
                        {t.subject && <p className="text-sm text-yellow-700 font-semibold">{t.subject}</p>}
                        {t.achievement && (
                          <span className="inline-block mt-1.5 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                            {t.achievement}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
                <div className="relative p-8 md:p-12">
                  {homeTestimonials.map((t, idx) => {
                    const testimonialText = t.text || t.quote || t.message || '';
                    const studentName = t.name || t.reviewerName || 'Student';
                    return (
                      <div
                        key={t.id || t._id || idx}
                        className={`transition-all duration-500 ${idx === activeTestimonialIndex ? 'block' : 'hidden'}`}
                      >
                        <div className="text-indigo-200 mb-4">
                          <Quote className="h-10 w-10" />
                        </div>
                        <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6 italic">
                          &ldquo;{testimonialText}&rdquo;
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{studentName}</p>
                            {t.subject && <p className="text-sm text-indigo-600 font-medium">{t.subject}</p>}
                          </div>
                          {t.achievement && (
                            <span className="hidden sm:inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              {t.achievement}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {homeTestimonials.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTestimonialIndex(prev => (prev - 1 + homeTestimonials.length) % homeTestimonials.length)}
                    className="p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all text-gray-600 hover:text-indigo-600"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex gap-2">
                    {homeTestimonials.slice(0, Math.min(homeTestimonials.length, 7)).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveTestimonialIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === activeTestimonialIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTestimonialIndex(prev => (prev + 1) % homeTestimonials.length)}
                    className="p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all text-gray-600 hover:text-indigo-600"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="text-center mt-8">
                <Link
                  to="/testimonials"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-all"
                >
                  View All Student Stories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Demo Form Section */}
      <section id="demo-form" className="py-10 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your Success Journey?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book a free personalized demo class and experience our teaching methodology firsthand.
              No commitment required - just quality education.
            </p>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center px-10 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95 gap-3"
            >
              <MessageSquare className="h-6 w-6" />
              Book a Free Demo Class
            </button>
          </div>

          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">100% Free Demo</h4>
                <p className="text-gray-600">No hidden charges or commitments</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Expert Faculty</h4>
                <p className="text-gray-600">Learn from experienced professionals</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Flexible Timing</h4>
                <p className="text-gray-600">Choose your preferred time slot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Form Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#1e3a8a]/40 backdrop-blur-md" onClick={() => setShowDemoModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DemoForm onSuccess={() => setShowDemoModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;