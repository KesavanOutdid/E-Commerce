const ProductTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductTableSkeleton
