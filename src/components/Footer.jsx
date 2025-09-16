import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xl font-bold text-blue-600">TalentFlow</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Streamlining the hiring process with intelligent assessment tools and candidate management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/jobs" className="text-base text-gray-500 hover:text-blue-600">
                  Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="text-base text-gray-500 hover:text-blue-600">
                  Candidates
                </Link>
              </li>
              <li>
                <Link to="/assessments" className="text-base text-gray-500 hover:text-blue-600">
                  Assessments
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-blue-600">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center text-gray-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@talentflow.com
              </li>
              <li className="flex items-center text-gray-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1-800-TALENT
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-400">
              © {new Date().getFullYear()} TalentFlow. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}