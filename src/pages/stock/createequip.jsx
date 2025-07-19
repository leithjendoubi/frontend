import { useState } from 'react';
import axios from 'axios';

const CreateEquipement = () => {
  const [formData, setFormData] = useState({
    UserId: '',
    nom: '',
    Poidsdisponibleenkillo: '',
    Prixparjour: '',
    Prixparkillo: '',
    listdesproduits: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('UserId', formData.UserId);
    data.append('nom', formData.nom);
    data.append('Poidsdisponibleenkillo', formData.Poidsdisponibleenkillo);
    data.append('Prixparjour', formData.Prixparjour);
    data.append('Prixparkillo', formData.Prixparkillo);
    data.append('listdesproduits', formData.listdesproduits.split(',').map(item => item.trim()));
    if (image) {
      data.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:4000/api/equipement/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add Authorization header if userAuth middleware requires it
          // e.g., Authorization: `Bearer ${token}`
        },
      });
      setMessage(response.data.message);
      setFormData({
        UserId: '',
        nom: '',
        Poidsdisponibleenkillo: '',
        Prixparjour: '',
        Prixparkillo: '',
        listdesproduits: '',
      });
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Equipment</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            type="text"
            name="UserId"
            value={formData.UserId}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Available Weight (kg)</label>
          <input
            type="number"
            name="Poidsdisponibleenkillo"
            value={formData.Poidsdisponibleenkillo}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price per Day</label>
          <input
            type="number"
            name="Prixparjour"
            value={formData.Prixparjour}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price per Kilo</label>
          <input
            type="number"
            name="Prixparkillo"
            value={formData.Prixparkillo}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product List (comma-separated)</label>
          <input
            type="text"
            name="listdesproduits"
            value={formData.listdesproduits}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., item1, item2, item3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Equipment
        </button>
      </form>
    </div>
  );
};

export default CreateEquipement;