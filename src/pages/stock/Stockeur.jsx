import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Card, CardContent, Grid, Link, List, ListItem, ListItemText, Divider } from '@mui/material';
import { toast } from 'react-toastify';

const Stockeur = () => {
  const [userId, setUserId] = useState('');
  const [stockisteDetails, setStockisteDetails] = useState(null);
  const [equipements, setEquipements] = useState([]); // Ensure initial state is an array
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // First useEffect: Fetch userId
  useEffect(() => {
    const fetchAndSetUserId = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/data');
        if (response.data.success && response.data.userData && response.data.userData.userId) {
          setUserId(response.data.userData.userId);
          setError(null);
        } else {
          setError("User data not found. Please ensure you are logged in.");
          setLoading(false);
          toast.error("User data not found. Please log in.");
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
        setError(err.response?.data?.message || "Failed to fetch user data. Are you logged in?");
        setLoading(false);
        toast.error(err.response?.data?.message || "Error connecting to authentication service.");
      }
    };

    fetchAndSetUserId();
  }, []);

  // Second useEffect: Fetch all other data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch Stockiste Details
        const stockisteResponse = await axios.get(`http://localhost:4000/api/stockiste/user/${userId}`);
        setStockisteDetails(stockisteResponse.data.stockiste);

        // Fetch Equipements
        const equipementResponse = await axios.get(`http://localhost:4000/api/equipement/user/${userId}`);
        // Ensure equipements is an array, default to empty array if undefined
        setEquipements(Array.isArray(equipementResponse.data.equipements) ? equipementResponse.data.equipements : []);

        // Fetch Demands
        const demandsResponse = await axios.get(`http://localhost:4000/api/stock/stockeur/${userId}`);
        setDemands(Array.isArray(demandsResponse.data.demands) ? demandsResponse.data.demands : []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load stockist dashboard data.");
        toast.error(err.response?.data?.message || "Error fetching stockist dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Render Logic
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!stockisteDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">No stockist details found for this user ID. Please ensure you have registered as a stockist.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Stockeur Dashboard
      </Typography>

      {/* Stockiste Details */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Stockist Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Legal Name:</strong> {stockisteDetails.nomlegal}</Typography>
              <Typography variant="body1"><strong>Professional Address:</strong> {stockisteDetails.addressProfessionelle}</Typography>
              <Typography variant="body1"><strong>Phone Number:</strong> {stockisteDetails.numeroPhone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Storage Type:</strong> {stockisteDetails.typedestockage}</Typography>
              <Typography variant="body1"><strong>Demand Status:</strong> {stockisteDetails.statusdedamnd}</Typography>
              <Typography variant="body1"><strong>Account Created:</strong> {new Date(stockisteDetails.datedecreation).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Required Documents:</Typography>
              {stockisteDetails.documents && Object.keys(stockisteDetails.documents).length > 0 ? (
                <List dense>
                  {Object.entries(stockisteDetails.documents).map(([key, doc]) => (
                    <ListItem key={key} disablePadding>
                      <ListItemText
                        primary={doc.title || key.replace(/_/g, ' ')}
                        secondary={
                          doc.url ? (
                            <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                              View Document
                            </Link>
                          ) : 'Document not uploaded'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Your Equipments */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Equipments
          </Typography>
          {equipements && equipements.length > 0 ? (
            <Grid container spacing={3}>
              {equipements.map((equipement) => (
                <Grid item xs={12} sm={6} md={4} key={equipement._id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>{equipement.nom}</Typography>
                      {equipement.image && (
                        <Box
                          component="img"
                          src={equipement.image}
                          alt={equipement.nom}
                          sx={{ width: '100%', height: 200, objectFit: 'cover', mb: 1, borderRadius: 1 }}
                        />
                      )}
                      <Typography variant="body2"><strong>Available Weight:</strong> {equipement.Poidsdisponibleenkillo} kg</Typography>
                      <Typography variant="body2"><strong>Stored Weight:</strong> {equipement.Poidsstocker} kg</Typography>
                      <Typography variant="body2"><strong>Products:</strong> {equipement.listdesproduits.join(', ')}</Typography>
                      <Typography variant="body2"><strong>Price per Day:</strong> {equipement.Prixparjour} TND</Typography>
                      <Typography variant="body2"><strong>Price per Kilo:</strong> {equipement.Prixparkillo} TND</Typography>
                      <Typography variant="caption" color="text.secondary">Added on: {new Date(equipement.Date).toLocaleDateString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No equipments found for your user ID. Add new equipment to your stock.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Your Demands */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Demands
          </Typography>
          {demands && demands.length > 0 ? (
            <List>
              {demands.map((demand, index) => (
                <React.Fragment key={demand._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`Demand ID: ${demand._id}`}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Status: {demand.status}
                          </Typography>
                          <br />
                          {demand.userDemandeur && (
                            <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                              Demander User: {demand.userDemandeur.name || 'N/A'} (ID: {demand.userDemandeur.userId})
                            </Typography>
                          )}
                          {demand.quantity && <Typography variant="body2" component="span" sx={{ display: 'block' }}>Quantity: {demand.quantity} kg</Typography>}
                          {demand.startDate && demand.endDate && (
                            <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                              Duration: {new Date(demand.startDate).toLocaleDateString()} - {new Date(demand.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                          {demand.type && <Typography variant="body2" component="span" sx={{ display: 'block' }}>Type: {demand.type}</Typography>}
                          {`Created: ${new Date(demand.createdAt).toLocaleDateString()} at ${new Date(demand.createdAt).toLocaleTimeString()}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < demands.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>No demands found for your user ID.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Stockeur;