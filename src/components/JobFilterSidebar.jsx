export default function JobFilterSidebar({
  status,
  setStatus,
  page,
  setPage,
  pageSize,
  total
}) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-4">
        {/* Filter Card */}
        <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Status
            </h3>
          </div>
          <div className="p-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full pl-4 pr-10 py-2.5 text-sm font-medium border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            >
              <option value="">🎯 All Status</option>
              <option value="active">✅ Active</option>
              <option value="archived">📦 Archived</option>
            </select>

            {status && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Active filter:</span>
                  <button
                    onClick={() => setStatus("")}
                    className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-xs text-gray-700 flex-1">
                    Status: <strong className="capitalize">{status}</strong>
                  </span>
                  <button
                    onClick={() => setStatus("")}
                    className="text-purple-600 hover:text-purple-800 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Card */}
        <div className="bg-white shadow-md rounded-xl border-2 border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Navigation
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Showing</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-bold">
                  {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Total positions</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-bold">
                  {total}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Page Info */}
            <div className="pt-3 border-t border-gray-200">
              <div className="text-center">
                <span className="text-xs text-gray-500">Page</span>
                <span className="mx-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                  {page}
                </span>
                <span className="text-xs text-gray-500">of {Math.ceil(total / pageSize)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 shadow-md rounded-xl border-2 border-indigo-200">
          <div className="px-5 py-4 border-b border-indigo-200 bg-white bg-opacity-50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistics
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700 font-medium">Total Jobs</span>
                <span className="text-2xl font-bold text-indigo-900">{total}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                <span className="text-xs text-gray-700 font-medium">Current Page</span>
                <span className="text-2xl font-bold text-indigo-900">{page}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
