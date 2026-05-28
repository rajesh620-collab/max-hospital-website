import { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Brain,
  Clock,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ChevronRight,
  Menu,
  X,
  Star,
  Award,
  Check,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Appointment Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    department: '',
    date: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState('');
  const [submittedAppointment, setSubmittedAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle navbar sticky status & scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Track active section for navbar indicators
      const sections = ['home', 'about', 'services', 'doctors', 'contact', 'appointment'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for that field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.age) {
      errors.age = 'Age is required';
    } else {
      const ageValue = Number(formData.age);
      if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
        errors.age = 'Please enter a valid age between 1 and 120';
      }
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.department) errors.department = 'Please select a department';
    if (!formData.date) {
      errors.date = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Appointment date cannot be in the past';
      }
    }
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate unique Registration ID BEFORE fetching so it gets stored in Google Sheets
      const randomNum = Math.floor(
        100000 + Math.random() * 900000
      );
      const refCode = `MAX-HYD-${randomNum}`;

      const submittedAt = new Date();
      const submittedTime = submittedAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // 2. Fetch with text/plain to BYPASS the CORS preflight (OPTIONS) browser check!
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxOEs3ZtVq2ALK0n4jIThzmVg0v1bd-JFJM_v86QRf2VkKmCEZlhhLq8gVssTbSzPwvaA/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            registrationId: refCode,
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            department: formData.department,
            message: formData.message,
            phone: formData.phone,
            date: formData.date,
            time: submittedTime
          }),
        }
      );

      const rawResponse = await response.text();
      let result = { success: false };

      if (rawResponse) {
        try {
          result = JSON.parse(rawResponse);
        } catch {
          // If response contains redirect/warnings wrappers, extract JSON string
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              result = JSON.parse(jsonMatch[0]);
            } catch {
              result = { success: false };
            }
          }
        }
      }

      const isSuccess = response.ok && (result?.success === true || /"success"\s*:\s*true/i.test(rawResponse));

      if (isSuccess) {
        setAppointmentRef(refCode);

        setSubmittedAppointment({
          ...formData,
          refCode,
        });

        setShowSuccessModal(true);

        // Reset Form
        setFormData({
          name: "",
          age: "",
          gender: "",
          phone: "",
          department: "",
          date: "",
          message: "",
        });

      } else {
        const errorMsg = result?.error ? `\n${result.error}` : '';
        alert(`Failed to book appointment:${errorMsg}`);
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      phone: '',
      department: '',
      date: '',
      message: ''
    });
    setFormErrors({});
    setShowSuccessModal(false);
    setSubmittedAppointment(null);
  };

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);

    const performScroll = () => {
      const element = document.getElementById(id);
      if (!element) return;

      const offset = 80; // fixed navbar height
      const elementPosition = window.scrollY + element.getBoundingClientRect().top;
      const targetPosition = Math.max(0, elementPosition - offset);

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    };

    // Allow mobile drawer to start closing before computing layout/target position.
    requestAnimationFrame(() => {
      requestAnimationFrame(performScroll);
    });
  };

  // Prevent past dates in appointment date input
  const getMinDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Doctors', id: 'doctors' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 selection:bg-hospital-500 selection:text-white">

      {/* 1. Header/Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-1.5'
          : 'bg-transparent py-3'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
              className="flex items-center gap-3 cursor-pointer focus:outline-none flex-shrink-0"
              id="navbar-logo"
            >
              <img
                src="/assets/logo.jpg"
                alt="MAX Logo"
                className="h-12 sm:h-16 w-auto object-contain transition-all duration-300"
              />
              <div className="flex items-center gap-2.5 whitespace-nowrap text-left">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
                  MAX
                </span>
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                    Super Speciality
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wider text-hospital-600 uppercase mt-0.5">
                    Hospital
                  </span>
                </div>
              </div>
            </a>



            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                  className={`text-sm font-semibold tracking-wide transition-all duration-200 hover:text-hospital-600 relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 rounded-md px-1 ${activeSection === link.id ? 'text-hospital-600' : 'text-slate-600'
                    }`}
                  id={`nav-link-${link.id}`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-hospital-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Appointment Button (Desktop) */}
            <div className="hidden lg:block">
              <button
                onClick={() => scrollToSection('appointment')}
                className="bg-hospital-600 hover:bg-hospital-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-hospital-200 hover:shadow-lg hover:shadow-hospital-300 transition-all duration-300 flex items-center gap-2 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500 focus-visible:ring-offset-2"
                id="btn-nav-appointment"
              >
                <Calendar className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                Book Appointment
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-hospital-500"
                aria-label="Toggle Menu"
                id="btn-mobile-menu-toggle"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden shadow-inner"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 focus:outline-none ${activeSection === link.id
                      ? 'bg-hospital-50 text-hospital-600'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    id={`mobile-nav-link-${link.id}`}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 px-4">
                  <button
                    onClick={() => scrollToSection('appointment')}
                    className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3 rounded-xl font-bold text-center shadow-md shadow-hospital-200 transition-all flex items-center justify-center gap-2 focus:outline-none"
                    id="btn-mobile-appointment"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section
        id="home"
        className="relative pt-32 pb-20 md:pt-44 md:pb-28 lg:pb-36 overflow-hidden bg-gradient-to-br from-hospital-50 via-white to-blue-50/30"
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-hospital-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Hero Text Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-hospital-100/80 border border-hospital-200/50 px-3 py-1.5 rounded-full text-hospital-700 text-xs sm:text-sm font-bold mb-6 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-hospital-600 fill-hospital-600" />
                <span>Advanced Multi-Speciality Healthcare Center</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
              >
                Trusted Quality Healthcare for{" "}
                <span className="bg-gradient-to-r from-hospital-700 to-hospital-500 bg-clip-text text-transparent">
                  a Healthier Life
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-650 mb-8 leading-relaxed max-w-xl"
              >
                Providing trusted, patient-centered healthcare with experienced specialists, advanced diagnostics, and modern treatment facilities. Led by <strong>Dr. Sirisha Yasa</strong> (Neurology), <strong>Dr. P. Praveen Reddy</strong> (Diabetology & General Medicine), and <strong>Dr. K. Rajasekhar Reddy</strong> (Orthopaedics), we offer comprehensive multispeciality medical care in Ameenpur, Hyderabad.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={() => scrollToSection('appointment')}
                  className="bg-hospital-600 hover:bg-hospital-700 text-white px-8 py-3.5 rounded-2xl font-bold tracking-wide shadow-lg shadow-hospital-200 hover:shadow-xl hover:shadow-hospital-300 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                  id="btn-hero-book"
                >
                  Book Appointment
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-3.5 rounded-2xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                  id="btn-hero-contact"
                >
                  Contact Us
                  <Phone className="w-4 h-4 text-slate-500" />
                </button>
              </motion.div>

              {/* Hero Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-3 gap-6 sm:gap-10 border-t border-slate-100 pt-8 mt-12 w-full max-w-lg"
              >
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">5.0 ★</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Google Rating</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4 Core</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Departments</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Patient Trust</div>
                </div>
              </motion.div>
            </div>

            {/* Hero Image Container */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative mx-auto max-w-lg lg:max-w-none flex justify-center items-center"
              >
                {/* Styled Frame for Hospital Image */}
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl glow-blue-lg bg-slate-200 border-4 border-white">
                  <img
                    src="/assets/hero-hospital.jpg"
                    alt="Max Super Speciality Hospital modern exterior"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Fallback visual design if image is missing
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('bg-gradient-to-br', 'from-hospital-500', 'to-hospital-800', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-white', 'p-6');
                      const titleNode = document.createElement('h3');
                      titleNode.innerText = 'Max Super Speciality Hospital';
                      titleNode.className = 'font-bold text-2xl text-center mb-2';
                      const descNode = document.createElement('p');
                      descNode.innerText = '[Please place "hero-hospital.jpg" in public/assets/]';
                      descNode.className = 'text-hospital-200 text-sm text-center font-mono bg-black/20 py-2 px-4 rounded-lg';
                      e.target.parentNode.appendChild(titleNode);
                      e.target.parentNode.appendChild(descNode);
                    }}
                  />
                </div>

                {/* Floating Highlights Badges */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">24/7 Clinical Support</div>
                    <div className="text-[11px] font-semibold text-slate-500">Emergency Response Ready</div>
                  </div>
                </div>


              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section
        id="about"
        className="relative py-32 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/waiting-hall.jpg"
            alt="Hospital Waiting Hall"
            className="w-full h-full object-cover scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/55"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          <div className="max-w-4xl">

            {/* Tag */}
            <span className="text-sm font-bold tracking-widest text-hospital-300 uppercase mb-4 block">
              About Our Hospital
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8">
              Ameenpur’s Trusted Destination for
              Advanced Multi-Speciality Healthcare
            </h2>

            {/* Description */}
            <p className="text-slate-200 text-lg leading-relaxed mb-12 max-w-3xl">
              Max Super Speciality Hospital, located in Ameenpur, Hyderabad,
              is committed to delivering high-quality healthcare through
              advanced diagnostics, experienced specialists, and compassionate
              patient care. We provide comprehensive treatment services across
              Neurology, Orthopaedics, Dermatology, Pediatrics, and
              Diabetology with a patient-focused and multidisciplinary
              approach.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h4 className="font-bold text-white text-lg mb-2">
                  Neurology Care
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Advanced neurological consultation and stroke care guided by
                  Dr. Sirisha Yasa.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h4 className="font-bold text-white text-lg mb-2">
                  General medicine, Diabetology and Pediatrics
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Child healthcare, vaccinations, diabetes management, and
                  family wellness services.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h4 className="font-bold text-white text-lg mb-2">
                  Orthopaedics & Surgery
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Comprehensive orthopaedic and joint pain treatments with
                  advanced recovery care.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h4 className="font-bold text-white text-lg mb-2">
                  Dermatology & Cosmetology
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Professional skincare, cosmetology, and dermatological
                  treatments by experienced specialists.
                </p>
              </div>


            </div>

            {/* Quote */}
            <div className="border-l-4 border-hospital-400 pl-5">
              <p className="italic text-slate-100 text-lg leading-relaxed mb-3">
                "At Max Super Speciality Hospital, we bring top-tier healthcare
                closer to you with compassionate and specialized treatment
                under one roof."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Services Section */}
      <section
        id="services"
        className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-hospital-100 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-100 rounded-full filter blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold tracking-widest text-hospital-600 uppercase mb-3 block">
              Core Specialities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Our Advanced Medical Services
            </h2>
            <p className="text-slate-655 text-slate-600">
              We deliver state-of-the-art diagnostics and treatments across multiple specialities with a team of highly experienced clinical experts.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Service 1: Neurology Care */}
            <div className="bg-white/95 backdrop-blur-sm hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:shadow-hospital-100/40 transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-3">Neurology & Stroke Care</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Rapid emergency triage and therapies for brain strokes, chronic migraine prevention, epilepsy/fits management, nerve disorders, and comprehensive neurological recovery.
              </p>
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-hospital-600 group-hover:text-hospital-700 transition-colors"
              >
                Book Neuro Consultation
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Service 2: Diabetology & Medicine */}
            <div className="bg-white/95 backdrop-blur-sm hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:shadow-hospital-100/40 transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-3">Diabetes & General Medicine</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Comprehensive care for Type-1 & Type-2 diabetes, hypertension control, metabolic syndromes, endocrine disorders, and general adult medical consultations.
              </p>
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-hospital-600 group-hover:text-hospital-700 transition-colors"
              >
                Book General Consultation
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Service 3: Orthopaedic & Joint Surgery */}
            <div className="bg-white/95 backdrop-blur-sm hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:shadow-hospital-100/40 transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-hospital-50 text-hospital-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-3">Orthopaedic & Joint Surgery</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Advanced clinical diagnosis and non-surgical/surgical treatment for chronic joint pains, spine compression, spondylosis, complex fractures, and arthritis recovery.
              </p>
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-hospital-600 group-hover:text-hospital-700 transition-colors"
              >
                Book Ortho Consultation
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Service 4: Dermatology & Cosmetology */}
            <div className="bg-white/95 backdrop-blur-sm hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:shadow-hospital-100/40 transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-3">Dermatology & Cosmetology</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Expert care for chronic skin disorders, acne, hair loss treatments, skin rejuvenation, cosmetological enhancements, and highly precise dermatological diagnostics.
              </p>
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-hospital-600 group-hover:text-hospital-700 transition-colors"
              >
                Book Skin Consultation
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Service 4: Pediatrics & Child Care */}
            {/* <div className="bg-white/95 backdrop-blur-sm hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:shadow-hospital-100/40 transition-all duration-300 flex flex-col items-start text-left group hover:-translate-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-3">Pediatrics & Child Health</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Attentive and friendly medical consults for children, routine vaccinations, pediatric fits management, childhood development checks, and general pediatric medicine.
              </p>
              <a
                href="#appointment"
                onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-hospital-600 group-hover:text-hospital-700 transition-colors"
              >
                Book Pediatric Appointment
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div> */}



            {/* Emergency Info Card */}
            <div className="bg-gradient-to-br from-hospital-600 to-hospital-800 p-8 rounded-3xl text-white shadow-xl shadow-hospital-300/40 flex flex-col justify-between items-start hover:-translate-y-1 transition-all duration-300 border border-hospital-500/20">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                  <Phone className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="font-extrabold text-xl mb-3">Emergency Call Desk</h3>
                <p className="text-hospital-100 text-sm leading-relaxed mb-6">
                  Facing a brain stroke or sudden orthopaedic/medical emergency? Every minute counts. Contact our immediate response team instantly.
                </p>
              </div>
              <a
                href="tel:+919949655665"
                className="bg-white hover:bg-slate-50 text-hospital-700 px-5 py-3 rounded-2xl font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center gap-2"
              >
                <Phone className="w-4 h-4 fill-hospital-700 text-hospital-700" />
                +91 9949655665
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Doctors Section */}
      <section
        id="doctors"
        className="py-20 bg-gradient-to-b from-white to-slate-50/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold tracking-widest text-hospital-600 uppercase mb-3 block">
              Medical Experts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Our Specialized Consulting Doctors
            </h2>
            <p className="text-slate-655 text-slate-600">
              Meet our team of board-certified, patient-centric clinical specialists dedicated to your complete recovery and family wellness.
            </p>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Doctor 1 */}
            <div className="group bg-white hover:bg-white rounded-3xl overflow-hidden border border-slate-200/70 hover:border-hospital-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              {/* Doctor Photo */}
              <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
                <img
                  src="/assets/doctor-1.jpg"
                  alt="Dr. Sirisha Yasa - Consultant Neurologist"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-gradient-to-br', 'from-hospital-600', 'to-hospital-800', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-white', 'p-4');
                    const textNode = document.createElement('span');
                    textNode.innerText = 'Dr. Sirisha Yasa';
                    textNode.className = 'font-bold text-lg text-center';
                    const specNode = document.createElement('span');
                    specNode.innerText = 'Consultant Neurologist';
                    specNode.className = 'text-xs text-hospital-200 mt-1';
                    e.target.parentNode.appendChild(textNode);
                    e.target.parentNode.appendChild(specNode);
                  }}
                />
              </div>
              {/* Doctor Info */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs uppercase font-extrabold tracking-widest text-hospital-600 mb-1">
                  Neurology
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-hospital-600 transition-colors">
                  Dr. Sirisha Yasa
                </h4>
                <div className="text-xs font-bold text-slate-500 mb-3">MBBS, MD, DrNB (Neuro) KIMS</div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-655 text-slate-500 flex items-center gap-1">
                    <Award className="w-4 h-4 text-hospital-600" />
                    15+ Years Exp
                  </span>
                  <button
                    onClick={() => scrollToSection('appointment')}
                    className="text-hospital-600 font-bold hover:text-hospital-700 transition-colors"
                  >
                    Consult
                  </button>
                </div>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="group bg-white hover:bg-white rounded-3xl overflow-hidden border border-slate-200/70 hover:border-hospital-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              {/* Doctor Photo */}
              <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
                <img
                  src="/assets/doctor-2.jpg"
                  alt="Dr. P. Praveen Reddy - Diabetologist & General Medicine"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-gradient-to-br', 'from-hospital-600', 'to-hospital-800', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-white', 'p-4');
                    const textNode = document.createElement('span');
                    textNode.innerText = 'Dr. P. Praveen Reddy';
                    textNode.className = 'font-bold text-lg text-center';
                    const specNode = document.createElement('span');
                    specNode.innerText = 'Diabetologist & General Medicine';
                    specNode.className = 'text-xs text-hospital-200 mt-1';
                    e.target.parentNode.appendChild(textNode);
                    e.target.parentNode.appendChild(specNode);
                  }}
                />
              </div>
              {/* Doctor Info */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs uppercase font-extrabold tracking-widest text-hospital-600 mb-1">
                  Diabetologist & General Medicine
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-hospital-600 transition-colors">
                  Dr. P. Praveen Reddy
                </h4>
                <div className="text-xs font-bold text-slate-500 mb-3">MBBS, DNB, FIDM (Diabetes)</div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-655 text-slate-500 flex items-center gap-1">
                    <Award className="w-4 h-4 text-hospital-600" />
                    14+ Years Exp
                  </span>
                  <button
                    onClick={() => scrollToSection('appointment')}
                    className="text-hospital-600 font-bold hover:text-hospital-700 transition-colors"
                  >
                    Consult
                  </button>
                </div>
              </div>
            </div>


            {/* Doctor 3 */}
            <div className="group bg-white hover:bg-white rounded-3xl overflow-hidden border border-slate-200/70 hover:border-hospital-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              {/* Doctor Photo */}
              <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
                <img
                  src="/assets/doctor-3.jpg"
                  alt="Dr. K. Rajasekhar Reddy - Consultant Orthopaedic Surgeon"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-gradient-to-br', 'from-hospital-600', 'to-hospital-800', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-white', 'p-4');
                    const textNode = document.createElement('span');
                    textNode.innerText = 'Dr. K. Rajasekhar Reddy';
                    textNode.className = 'font-bold text-lg text-center';
                    const specNode = document.createElement('span');
                    specNode.innerText = 'Consultant Orthopaedic Surgeon';
                    specNode.className = 'text-xs text-hospital-200 mt-1';
                    e.target.parentNode.appendChild(textNode);
                    e.target.parentNode.appendChild(specNode);
                  }}
                />
              </div>
              {/* Doctor Info */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs uppercase font-extrabold tracking-widest text-hospital-600 mb-1">
                  Orthopaedics
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-hospital-600 transition-colors">
                  Dr. K. Rajasekhar Reddy
                </h4>
                <div className="text-xs font-bold text-slate-500 mb-3">MBBS, MS (Ortho)</div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-655 text-slate-500 flex items-center gap-1">
                    <Award className="w-4 h-4 text-hospital-600" />
                    16+ Years Exp
                  </span>
                  <button
                    onClick={() => scrollToSection('appointment')}
                    className="text-hospital-600 font-bold hover:text-hospital-700 transition-colors"
                  >
                    Consult
                  </button>
                </div>
              </div>
            </div>



            {/* Doctor 4 */}
            <div className="group bg-white hover:bg-white rounded-3xl overflow-hidden border border-slate-200/70 hover:border-hospital-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              {/* Doctor Photo */}
              <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
                <img
                  src="/assets/doctor-4.jpg"
                  alt="Dr. G. Sailaja - Dermatologist & Cosmetologist"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-gradient-to-br', 'from-hospital-600', 'to-hospital-800', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-white', 'p-4');
                    const textNode = document.createElement('span');
                    textNode.innerText = 'Dr. G. Sailaja';
                    textNode.className = 'font-bold text-lg text-center';
                    const specNode = document.createElement('span');
                    specNode.innerText = 'Dermatologist & Cosmetologist';
                    specNode.className = 'text-xs text-hospital-200 mt-1';
                    e.target.parentNode.appendChild(textNode);
                    e.target.parentNode.appendChild(specNode);
                  }}
                />
              </div>
              {/* Doctor Info */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs uppercase font-extrabold tracking-widest text-hospital-600 mb-1">
                  Dermatology
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-hospital-600 transition-colors">
                  Dr. G. Sailaja
                </h4>
                <div className="text-xs font-bold text-slate-500 mb-3">MBBS, DDVL</div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-655 text-slate-500 flex items-center gap-1">
                    <Award className="w-4 h-4 text-hospital-600" />
                    12+ Years Exp
                  </span>
                  <button
                    onClick={() => scrollToSection('appointment')}
                    className="text-hospital-600 font-bold hover:text-hospital-700 transition-colors"
                  >
                    Consult
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Appointment Form Section */}
      <section
        id="appointment"
        className="py-20 bg-gradient-to-br from-hospital-50 via-white to-blue-50/40 relative overflow-hidden"
      >
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-hospital-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Text Information Column */}
            <div className="lg:col-span-5 flex flex-col text-left">
              <span className="text-sm font-bold tracking-widest text-hospital-600 uppercase mb-3 block">
                Quick Scheduling
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Schedule Your Specialized Consultation
              </h2>
              <p className="text-slate-650 text-slate-600 leading-relaxed mb-8">
                Requesting an appointment is quick and seamless. Fill in your patient details, select your specialty, and submit. Our outpatient front desk at Ameenpur will contact you via phone or SMS within 2 hours to finalize your exact slot.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hospital-100 flex items-center justify-center text-hospital-600">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold text-slate-700">Attentive care by board-certified specialists</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hospital-100 flex items-center justify-center text-hospital-600">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold text-slate-700">Rapid booking confirmation within 2 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hospital-100 flex items-center justify-center text-hospital-600">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold text-slate-700">Cost-effective diagnostic consults</span>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/70 p-8 sm:p-10 glow-blue ring-1 ring-white">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 text-left">Request an Appointment</h3>
                <p className="text-slate-500 text-sm mb-6 text-left">Please enter your patient details below correctly.</p>

                <form onSubmit={handleFormSubmit} className="space-y-5 text-left">

                  {/* Name Input */}
                  <div>
                    <label htmlFor="form-name" className="block text-sm font-bold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="form-name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Patient Name"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 ${formErrors.name
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                          }`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Age Input */}
                  <div>
                    <label htmlFor="form-age" className="block text-sm font-bold text-slate-700 mb-2">
                      Age
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        name="age"
                        id="form-age"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="25"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 ${formErrors.age
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                          }`}
                      />
                    </div>
                    {formErrors.age && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {formErrors.age}
                      </p>
                    )}
                  </div>

                  {/* Gender Input */}
                  <div>
                    <label htmlFor="form-gender" className="block text-sm font-bold text-slate-700 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <select
                        name="gender"
                        id="form-gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-850 appearance-none ${formErrors.gender
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                          }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label htmlFor="form-phone" className="block text-sm font-bold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="form-phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9949655665"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 ${formErrors.phone
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                          }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Department Dropdown */}
                    <div>
                      <label htmlFor="form-department" className="block text-sm font-bold text-slate-700 mb-2">
                        Speciality / Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Activity className="w-5 h-5" />
                        </div>
                        <select
                          name="department"
                          id="form-department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-850 appearance-none ${formErrors.department
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                            }`}
                        >
                          <option value="">Select Specialty</option>
                          <option value="Neurology">Neurology & Stroke</option>
                          <option value="Orthopaedics">Orthopaedics & Joint Surgery</option>
                          <option value="Dermatology & Cosmetology">Dermatology & Cosmetology</option>
                          <option value="Pediatrics & Diabetology">Pediatrics & Diabetology</option>
                          <option value="General Medicine">General Medicine</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          {/* Custom Dropdown Arrow */}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                      {formErrors.department && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {formErrors.department}
                        </p>
                      )}
                    </div>

                    {/* Date Picker */}
                    <div>
                      <label htmlFor="form-date" className="block text-sm font-bold text-slate-700 mb-2">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <input
                          type="date"
                          name="date"
                          id="form-date"
                          min={getMinDate()}
                          value={formData.date}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 ${formErrors.date
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-200 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500'
                            }`}
                        />
                      </div>
                      {formErrors.date && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {formErrors.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional Message */}
                  <div>
                    <label htmlFor="form-message" className="block text-sm font-bold text-slate-700 mb-2">
                      Symptoms / Patient Notes (Optional)
                    </label>
                    <textarea
                      name="message"
                      id="form-message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share details about joint pains, skin issues, headaches, diabetic conditions, or child health..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 focus:ring-1 focus:ring-hospital-500 focus:border-hospital-500"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-2xl font-bold tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 ${isSubmitting
                      ? 'bg-slate-400 text-white cursor-not-allowed opacity-80'
                      : 'bg-hospital-600 hover:bg-hospital-700 text-white shadow-hospital-200 hover:shadow-xl hover:shadow-hospital-300'
                      }`}
                    id="btn-form-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Requesting Slot...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Request Appointment Slot
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-b from-white via-slate-50/40 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold tracking-widest text-hospital-600 uppercase mb-3 block">
              Contact Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Visit or Contact Our Hospital
            </h2>
            <p className="text-slate-655 text-slate-600">
              Find our clinic location coordinates, email handles, and contact numbers. Drop in or call for immediate diagnostic support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

            {/* Left: Contact Info */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-8">

              <div className="space-y-6">
                <h3 className="text-2xl font-extrabold text-slate-900">Branch Address & Contacts</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We are centrally located in Ameenpur, Hyderabad. Highly accessible from Miyapur metro or major expressways. Valet and visitor parking is available.
                </p>
              </div>

              {/* Address card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-hospital-100 text-hospital-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Our Location</h4>
                  <p className="text-slate-650 text-sm leading-relaxed">
                    Max Super Speciality Hospital,<br />
                    2nd Floor, Ameenpur Road, Maruthi Hill Society,<br />
                    Bandam Kommu, Ameenpur, Hyderabad 502032
                  </p>
                </div>
              </div>

              {/* Phone card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-hospital-100 text-hospital-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Contact Number</h4>
                  <p className="text-slate-650 text-sm leading-relaxed">
                    Reception: <a href="tel:+919949655665" className="text-hospital-650 font-bold hover:underline">+91 9949655665</a><br />
                    Emergency: <a href="tel:+919949655665" className="text-hospital-650 font-bold hover:underline">+91 9949655665</a>
                  </p>
                </div>
              </div>

              {/* Email card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-hospital-100 text-hospital-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">Email Coordinates</h4>
                  <p className="text-slate-650 text-sm leading-relaxed">
                    Support Desk: <a href="mailto:maxhospitalameenpur@gmail.com" className="text-hospital-655 hover:underline text-hospital-600 font-bold">maxhospitalameenpur@gmail.com</a><br />
                    Appointments: <a href="mailto:maxhospitalameenpur@gmail.com" className="text-hospital-655 hover:underline text-hospital-600 font-bold">maxhospitalameenpur@gmail.com</a>
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Interactive Google Map */}
            <div className="lg:col-span-7">
              <div className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md relative group flex flex-col justify-between bg-slate-100">

                {/* Real Interactive Google Map Iframe */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5291.973090124595!2d78.31815263774217!3d17.5071710731285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb931610abfc5d%3A0x2b317a3f0fa50715!2sMax%20Super%20Speciality%20Hospital!5e1!3m2!1sen!2sin!4v1779381889900!5m2!1sen!2sin"
                  className="w-full h-full min-h-[420px] border-0 z-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Max Super Speciality Hospital Ameenpur Google Map"
                ></iframe>

                {/* Elegant overlay card at the bottom */}
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/10 opacity-95 group-hover:opacity-100 transition-opacity">
                  <div className="text-left">
                    <h5 className="font-extrabold text-sm mb-0.5 flex items-center gap-1.5 text-hospital-400">
                      <MapPin className="w-4 h-4 text-hospital-400" />
                      Max Super Speciality Hospital
                    </h5>
                    <p className="text-slate-350 text-[11px] leading-tight font-medium">2nd Floor, Ameenpur Road, Maruthi Hill Society, Ameenpur, Hyderabad</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/place/Max+Super+Speciality+Hospital/@17.5075144,78.3184464,17z/data=!3m1!4m6!3m5!1s0x3bcb931610abfc5d:0x2b317a3f0fa50715!8m2!3d17.5075144!4d78.3184464"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 flex-shrink-0"
                  >
                    Get Directions
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">

            {/* Brand column */}
            <div className="lg:col-span-4 text-left">
              <a
                href="#home"
                onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
                className="flex items-center gap-2 group cursor-pointer mb-5"
              >
                <div className="w-10 h-10 rounded-xl bg-hospital-600 text-white flex items-center justify-center shadow-md">
                  <HeartPulse className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl leading-none text-white tracking-tight">
                    MAX
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-hospital-400 leading-none mt-1">
                    Super Speciality
                  </span>
                </div>
              </a>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                5.0-Star rated advanced medical diagnostic clinic. Led by <strong>Dr. Sirisha Yasa</strong> (Neurology), <strong>Dr. P. Praveen Reddy</strong> (Diabetology & General Medicine), and <strong>Dr. K. Rajasekhar Reddy</strong> (Orthopaedics), we offer comprehensive multispeciality medical care in Ameenpur, Hyderabad.
              </p>
              {/* Social media icons */}
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-hospital-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-hospital-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors" aria-label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-hospital-600 hover:text-white text-slate-400 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="lg:col-span-3 lg:col-start-6 text-left">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-5">Quick Navigations</h4>
              <ul className="space-y-3 text-sm">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                      className="hover:text-hospital-400 transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-hospital-400 transition-colors" />
                      {link.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#appointment"
                    onClick={(e) => { e.preventDefault(); scrollToSection('appointment'); }}
                    className="hover:text-hospital-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-hospital-400 transition-colors" />
                    Book Appointment
                  </a>
                </li>
              </ul>
            </div>

            {/* Specialties Column */}
            <div className="lg:col-span-3 text-left">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-5">Specialities</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-hospital-400 transition-colors flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>Neurology & Stroke</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-hospital-400 transition-colors flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>Orthopaedics & Joints</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-hospital-400 transition-colors flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>Dermatology & Cosmetology</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-hospital-400 transition-colors flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>Pediatrics & Child Care</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-hospital-400 transition-colors flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>Diabetes & Medicine</a></li>
              </ul>
            </div>

          </div>

          {/* Copyright Area */}
          <div className="border-t border-slate-900 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} Max Super Speciality Hospital, Hyderabad. All rights reserved. Locally operated clinical medical branch.
            </p>
            <div className="flex gap-6 text-slate-500">
              <a href="#home" className="hover:text-hospital-400 hover:underline">Privacy Policy</a>
              <a href="#home" className="hover:text-hospital-400 hover:underline">Terms of Use</a>
              <a href="#home" className="hover:text-hospital-400 hover:underline">Sitemap</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Appointment Confirmation Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative z-10 border border-slate-100 text-center"
            >
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <h4 className="text-2xl font-extrabold text-slate-955 mb-2">Appointment Requested!</h4>
              <p className="text-slate-550 text-sm text-slate-500 mb-6">
                Your consultation request has been logged successfully. Our help desk at Ameenpur branch will contact you to confirm your slot within 2 hours.
              </p>

              {/* Reference ID card */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Reference ID:</span>
                  <span className="font-mono font-bold text-hospital-600">{submittedAppointment?.refCode || appointmentRef}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Patient Name:</span>
                  <span className="font-extrabold text-slate-800">{submittedAppointment?.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Age:</span>
                  <span className="font-extrabold text-slate-800">{submittedAppointment?.age}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Department:</span>
                  <span className="font-extrabold text-slate-800">{submittedAppointment?.department}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Date Chosen:</span>
                  <span className="font-extrabold text-slate-800">{submittedAppointment?.date}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={resetForm}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white py-3.5 rounded-2xl font-extrabold tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                id="btn-modal-close"
              >
                <ThumbsUp className="w-5 h-5" />
                Understood, Thank You
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppFloatingButton />

    </div>
  );
}

export default App;
