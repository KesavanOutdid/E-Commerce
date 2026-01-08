const ProductFormSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-md"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-36 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded-md"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                <div className="h-32 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-md"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-md"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl">
            <div className="h-12 bg-gray-200 rounded-md mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  )
}

export default ProductFormSkeleton
