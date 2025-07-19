import { useEffect, useState } from 'react';

const Livreur = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [userDataMap, setUserDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLivreurs = async () => {
      try {
        // Fetch livreurs data
        const response = await fetch('http://localhost:4000/api/livreur/getaccepte');
        if (!response.ok) {
          throw new Error('Failed to fetch livreurs');
        }
        const data = await response.json();
        
        if (data.success) {
          setLivreurs(data.data);
          
          // Fetch user data for each livreur
          const userDataPromises = data.data.map(async (livreur) => {
            try {
              const userResponse = await fetch(
                `http://localhost:4000/api/user/userdata/${livreur.userId}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              
              if (!userResponse.ok) {
                console.error(`Failed to fetch user data for userId: ${livreur.userId}`);
                return null;
              }
              
              const userData = await userResponse.json();
              return userData.success ? userData.userData : null;
            } catch (err) {
              console.error(`Error fetching user data for ${livreur.userId}:`, err);
              return null;
            }
          });

          const userDataResults = await Promise.all(userDataPromises);
          const userDataMap = {};
          
          data.data.forEach((livreur, index) => {
            if (userDataResults[index]) {
              userDataMap[livreur.userId] = userDataResults[index];
            }
          });
          
          setUserDataMap(userDataMap);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLivreurs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xl">Error loading livreurs</p>
        <p className="text-sm mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">List of Accepted Livreurs</h1>
      
      {livreurs.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mt-4">No livreurs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livreurs.map((livreur) => {
            const userData = userDataMap[livreur.userId];
            
            return (
              <div key={livreur._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="p-6">
                  {/* Profile section with image and name */}
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      {userData?.image ? (
                        <img 
                          src={userData.image} 
                          alt={`${userData?.name || 'User'} profile`}
                          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4 border-2 border-white shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {userData?.isAccountVerified && (
                        <div className="absolute bottom-0 right-4 bg-blue-500 text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {userData?.name || 'Unknown User'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {userData?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">City:</span>
                      <span className="text-gray-800">{livreur.citeprincipale}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-800">{livreur.telephone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Available Volume:</span>
                      <span className="text-gray-800">{livreur.VolumeDisponibleParDefaut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Max Weight:</span>
                      <span className="text-gray-800">{livreur.poidsMaximale}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        livreur.statutDemande === 'Accepté' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {livreur.statutDemande}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Livreur;