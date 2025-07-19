import { useEffect, useState } from 'react';

const VendeurList = () => {
  const [vendeurs, setVendeurs] = useState([]);
  const [userDataMap, setUserDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendeurs = async () => {
      try {
        // Fetch vendeurs data
        const response = await fetch('http://localhost:4000/api/vendeur/demandsaccepted');
        if (!response.ok) {
          throw new Error('Failed to fetch vendeurs');
        }
        const data = await response.json();
        
        if (data) {
          setVendeurs(data);
          
          // Fetch user data for each vendeur
          const userDataPromises = data.map(async (vendeur) => {
            try {
              const userResponse = await fetch(
                `http://localhost:4000/api/user/userdata/${vendeur.userId}`
              );
              
              if (!userResponse.ok) {
                console.error(`Failed to fetch user data for userId: ${vendeur.userId}`);
                return null;
              }
              
              const userData = await userResponse.json();
              return userData.success ? userData.userData : null;
            } catch (err) {
              console.error(`Error fetching user data for ${vendeur.userId}:`, err);
              return null;
            }
          });

          const userDataResults = await Promise.all(userDataPromises);
          const userDataMap = {};
          
          data.forEach((vendeur, index) => {
            if (userDataResults[index]) {
              userDataMap[vendeur.userId] = userDataResults[index];
            }
          });
          
          setUserDataMap(userDataMap);
        } else {
          throw new Error('No data received');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendeurs();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Accepted Sellers</h1>
      
      {vendeurs.length === 0 ? (
        <p className="text-center text-gray-500">No sellers found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendeurs.map((vendeur) => {
            const userData = userDataMap[vendeur.userId];
            const imageUrl = userData?.image;
            
            return (
              <div key={vendeur._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  {/* Profile section with image and name */}
                  <div className="flex items-center mb-4">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`${userData?.name || vendeur.nometprenomlegal || 'Seller'} profile`}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">
                        {vendeur.nometprenomlegal || 'Unknown Seller'}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {userData?.isAccountVerified ? (
                          <span className="text-green-500">Verified</span>
                        ) : (
                          <span className="text-yellow-500">Not Verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {vendeur.numeroPhone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {userData?.email || 'Not provided'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Address:</span> {vendeur.adressProfessionnel}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Categories:</span> {vendeur.categorieProduitMarche?.join(', ') || 'None'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        vendeur.statutdemande === 'مقبول' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vendeur.statutdemande}
                      </span>
                    </p>
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

export default VendeurList;