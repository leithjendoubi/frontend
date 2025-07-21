import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { 
  Box, Typography, CircularProgress, Card, CardContent, 
  Grid, Button, Modal, TextField, Select, MenuItem, 
  FormControl, InputLabel, Alert, Avatar, List, ListItem, 
  ListItemText, Divider, Chip
} from '@mui/material';
import {
  Storage, CalendarToday, Scale, Inventory, 
  Close, CheckCircle, ErrorOutline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const BlueButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  padding: '10px 20px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
}));

const EquipmentCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  }
}));

const FindStockage = () => {
  const { userData } = useContext(AppContext);
  const [equipements, setEquipements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEquipement, setSelectedEquipement] = useState(null);
  const [formData, setFormData] = useState({
    dateentre: '',
    datesortie: '',
    produitid: '',
    poidsastocker: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipementsResponse = await axios.get('http://localhost:4000/api/equipement/all');
        if (equipementsResponse.data.success) {
          setEquipements(equipementsResponse.data.equipements);
        } else {
          setError(equipementsResponse.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUserProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/product/user/my-products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('خطأ في جلب المنتجات:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDemandStockage = async (equipement) => {
    setSelectedEquipement(equipement);
    await fetchUserProducts();
    setModalOpen(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const requestBody = {
        userId: userData.userId,
        equipementId: selectedEquipement._id,
        dateentre: formData.dateentre,
        datesortie: formData.datesortie,
        produitid: formData.produitid,
        poidsastocker: formData.poidsastocker
      };

      const response = await axios.post('http://localhost:4000/stock/', requestBody);

      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({
          dateentre: '',
          datesortie: '',
          produitid: '',
          poidsastocker: ''
        });
        setTimeout(() => {
          setModalOpen(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        setSubmitError(response.data.message);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          <Typography variant="h6">خطأ في تحميل المعدات</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 700, 
        color: 'primary.main',
        mb: 4,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}>
        <Storage fontSize="large" /> معدات التخزين المتاحة
      </Typography>
      
      <Grid container spacing={4}>
        {equipements.map((equipement) => (
          <Grid item xs={12} sm={6} md={4} key={equipement._id}>
            <EquipmentCard>
              <Box
                component="img"
                src={equipement.image}
                alt={equipement.nom}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
              
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Storage color="primary" /> {equipement.nom}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Scale color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          متاح
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {equipement.Poidsdisponibleenkillo} كغ
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Inventory color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          مخزن
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {equipement.Poidsstocker} كغ
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        السعر/يوم
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="primary.main">
                        {equipement.Prixparjour} د.ت
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        السعر/كغ
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="primary.main">
                        {equipement.Prixparkillo} د.ت
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    المنتجات المتوافقة:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {equipement.listdesproduits.map((product, index) => (
                      <Chip 
                        key={index} 
                        label={product} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  مضاف في: {new Date(equipement.Date).toLocaleDateString()}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <BlueButton
                    fullWidth
                    onClick={() => handleDemandStockage(equipement)}
                    startIcon={<Inventory />}
                  >
                    طلب تخزين
                  </BlueButton>
                </Box>
              </CardContent>
            </EquipmentCard>
          </Grid>
        ))}
      </Grid>

      {/* Modal for stockage demand */}
      <Modal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Storage color="primary" /> طلب تخزين
            </Typography>
            <Button 
              onClick={() => setModalOpen(false)} 
              disabled={submitting}
              sx={{ minWidth: 40 }}
            >
              <Close />
            </Button>
          </Box>
          
          {submitSuccess ? (
            <Alert 
              severity="success" 
              icon={<CheckCircle fontSize="inherit" />}
              sx={{ mb: 3 }}
            >
              تم تقديم طلب التخزين بنجاح!
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                المعدات: <strong>{selectedEquipement?.nom}</strong>
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تاريخ الدخول"
                    type="datetime-local"
                    name="dateentre"
                    value={formData.dateentre}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    InputProps={{
                      startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تاريخ الخروج"
                    type="datetime-local"
                    name="datesortie"
                    value={formData.datesortie}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    InputProps={{
                      startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>اختر منتج</InputLabel>
                    <Select
                      label="اختر منتج"
                      name="produitid"
                      value={formData.produitid}
                      onChange={handleInputChange}
                      required
                      disabled={productsLoading}
                      startAdornment={<Inventory color="action" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="">
                        <em>-- اختر منتج --</em>
                      </MenuItem>
                      {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} ({product.category} - {product.subCategory})
                        </MenuItem>
                      ))}
                    </Select>
                    {productsLoading && (
                      <Typography variant="caption" color="text.secondary">
                        جاري تحميل المنتجات...
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={`الوزن للتخزين (كغ) - الحد الأقصى: ${selectedEquipement?.Poidsdisponibleenkillo} كغ`}
                    type="number"
                    name="poidsastocker"
                    value={formData.poidsastocker}
                    onChange={handleInputChange}
                    required
                    inputProps={{
                      min: 1,
                      max: selectedEquipement?.Poidsdisponibleenkillo
                    }}
                    InputProps={{
                      startAdornment: <Scale color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
              
              {submitError && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 3 }}
                  icon={<ErrorOutline fontSize="inherit" />}
                >
                  {submitError}
                </Alert>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <BlueButton
                  type="submit"
                  disabled={submitting || productsLoading}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {submitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
                </BlueButton>
              </Box>
            </form>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default FindStockage;