import { RECRUITMENT_STAGES } from "../config/stages";

export default function CandidateFilterSidebar({ 
  searchQuery, 
  setSearchQuery, 
  selectedStage, 
  setSelectedStage,
  totalCandidates,
  filteredCount 
}) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-3">
        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Stage
          </h3>
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedStage("")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                selectedStage === ""
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 border border-transparent hover:bg-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                All Stages
              </span>
              {selectedStage === "" && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {RECRUITMENT_STAGES.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                  selectedStage === stage.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-gray-50 text-gray-700 border border-transparent hover:bg-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{stage.icon}</span>
                  <span>{stage.label}</span>
                </span>
                {selectedStage === stage.id && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md border border-blue-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Stats
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">{totalCandidates}</span>
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="text-xs text-gray-600">Filtered</span>
                <span className="text-xl font-bold text-blue-700">{filteredCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedStage) && (
          <div className="bg-white rounded-lg shadow-md border border-orange-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Active
            </h3>
            <div className="space-y-1.5">
              {searchQuery && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-xs text-gray-700 truncate">Search: <strong>{searchQuery}</strong></span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedStage && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-xs text-gray-700 truncate">
                    Stage: <strong>{RECRUITMENT_STAGES.find(s => s.id === selectedStage)?.label}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedStage('')}
                    className="text-orange-600 hover:text-orange-800 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStage('');
                }}
                className="w-full mt-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
