import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, CircularProgress, Card, CardContent, Grid, 
  Link, List, ListItem, ListItemText, Divider, Button, Dialog, 
  Chip, Avatar, Paper, Stack
} from '@mui/material';
import { 
  Business, Storage, Phone, LocationOn, 
  DateRange, AttachFile, Add, CheckCircle, 
  Pending, Inventory, RequestPage, Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { styled } from '@mui/material/styles';

const BlueCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor: status === 'accepted' ? '#e6f7ee' : 
                  status === 'pending' ? '#fff8e6' : '#ffebee',
  color: status === 'accepted' ? '#1a8652' : 
         status === 'pending' ? '#b38700' : '#d32f2f',
  fontWeight: 600,
  fontSize: '0.75rem'
}));

const Stockeur = () => {
  const [userId, setUserId] = useState('');
  const [stockisteDetails, setStockisteDetails] = useState(null);
  const [equipements, setEquipements] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // First useEffect: Fetch userId
  useEffect(() => {
    const fetchAndSetUserId = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/data');
        if (response.data.success && response.data.userData && response.data.userData.userId) {
          setUserId(response.data.userData.userId);
          setError(null);
        } else {
          setError("لم يتم العثور على بيانات المستخدم. يرجى التأكد من تسجيل الدخول.");
          setLoading(false);
          toast.error("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول.");
        }
      } catch (err) {
        console.error("خطأ في جلب معرف المستخدم:", err);
        setError(err.response?.data?.message || "فشل جلب بيانات المستخدم. هل أنت مسجل الدخول؟");
        setLoading(false);
        toast.error(err.response?.data?.message || "خطأ في الاتصال بخدمة المصادقة.");
      }
    };

    fetchAndSetUserId();
  }, []);

  // Second useEffect: Fetch all other data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        // جلب تفاصيل المخزن
        const [stockisteResponse, equipementResponse, demandsResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/stockiste/user/${userId}`),
          axios.get(`http://localhost:4000/api/equipement/user/${userId}`),
          axios.get(`http://localhost:4000/api/stock/stockeur/${userId}`)
        ]);

        setStockisteDetails(stockisteResponse.data.stockiste);
        setEquipements(Array.isArray(equipementResponse.data.equipements) ? equipementResponse.data.equipements : []);
        setDemands(Array.isArray(demandsResponse.data.demands) ? demandsResponse.data.demands : []);

      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setError(err.response?.data?.message || "فشل تحميل بيانات لوحة تحكم المخزن.");
        toast.error(err.response?.data?.message || "خطأ في جلب بيانات لوحة تحكم المخزن.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const CreateEquip = React.lazy(() => import('C:/Users/leith/Desktop/firma/client/src/pages/stock/createequip.jsx'));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography variant="h6" color="primary">
          جاري تحميل لوحة تحكم المخزن...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="h5" color="error" gutterBottom>
            خطأ في تحميل لوحة التحكم
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            startIcon={<Refresh />}
          >
            تحديث الصفحة
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!stockisteDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
          <Typography variant="h5" gutterBottom>
            لم يتم العثور على ملف المخزن
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            يرجى التأكد من تسجيلك كمخزن للوصول إلى لوحة التحكم هذه.
          </Typography>
          <Button variant="contained" color="primary">
            التسجيل كمخزن
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1800px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 700, 
        color: 'primary.dark',
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Business fontSize="large" /> لوحة تحكم المخزن
      </Typography>

      {/* تفاصيل المخزن */}
      <BlueCard sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main'
          }}>
            <Business color="primary" /> ملف المخزن الخاص بك
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Business color="action" />
                  <Typography variant="body1">
                    <strong>الاسم القانوني:</strong> {stockisteDetails.nomlegal}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <LocationOn color="action" />
                  <Typography variant="body1">
                    <strong>العنوان:</strong> {stockisteDetails.addressProfessionelle}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone color="action" />
                  <Typography variant="body1">
                    <strong>الهاتف:</strong> {stockisteDetails.numeroPhone}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Storage color="action" />
                  <Typography variant="body1">
                    <strong>نوع التخزين:</strong> {stockisteDetails.typedestockage}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  {stockisteDetails.statusdedamnd === 'accepted' ? 
                    <CheckCircle color="success" /> : <Pending color="warning" />}
                  <Typography variant="body1">
                    <strong>الحالة:</strong> 
                    <StatusChip 
                      label={stockisteDetails.statusdedamnd === 'accepted' ? 'مقبول' : 
                            stockisteDetails.statusdedamnd === 'pending' ? 'قيد الانتظار' : 
                            stockisteDetails.statusdedamnd}
                      status={stockisteDetails.statusdedamnd} 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <DateRange color="action" />
                  <Typography variant="body1">
                    <strong>تاريخ الإنشاء:</strong> {new Date(stockisteDetails.datedecreation).toLocaleDateString('ar-EG')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFile color="primary" /> المستندات المطلوبة
              </Typography>
              
              {stockisteDetails.documents && Object.keys(stockisteDetails.documents).length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(stockisteDetails.documents).map(([key, doc]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {doc.title || key.replace(/_/g, ' ')}
                        </Typography>
                        {doc.url ? (
                          <Button 
                            component="a" 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            عرض المستند
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            غير مرفوع
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد مستندات مرفوعة حتى الآن.
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </BlueCard>

      {/* معدات التخزين الخاصة بك */}
      <BlueCard sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'primary.main'
            }}>
              <Inventory color="primary" /> معدات التخزين الخاصة بك
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenDialog}
              startIcon={<Add />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }
              }}
            >
              إضافة معدات جديدة
            </Button>
          </Box>
          
          {equipements.length > 0 ? (
            <Grid container spacing={3}>
              {equipements.map((equipement) => (
                <Grid item xs={12} sm={6} md={4} key={equipement._id}>
                  <BlueCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Storage color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {equipement.nom}
                        </Typography>
                      </Box>
                      
                      {equipement.image && (
                        <Box
                          component="img"
                          src={equipement.image}
                          alt={equipement.nom}
                          sx={{ 
                            width: '100%', 
                            height: 180, 
                            objectFit: 'cover', 
                            mb: 2, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      )}
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>متاح:</strong>
                          </Typography>
                          <Typography variant="body1">
                            {equipement.Poidsdisponibleenkillo} كغ
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>مخزن:</strong>
                          </Typography>
                          <Typography variant="body1">
                            {equipement.Poidsstocker} كغ
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>المنتجات:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {equipement.listdesproduits.map((product, index) => (
                              <Chip 
                                key={index} 
                                label={product} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>السعر/اليوم:</strong>
                          </Typography>
                          <Typography variant="body1" color="primary.main" fontWeight={600}>
                            {equipement.Prixparjour} د.ت
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>السعر/كغ:</strong>
                          </Typography>
                          <Typography variant="body1" color="primary.main" fontWeight={600}>
                            {equipement.Prixparkillo} د.ت
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            تاريخ الإضافة: {new Date(equipement.Date).toLocaleDateString('ar-EG')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </BlueCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                لم يتم العثور على معدات تخزين. أضف أول معداتك للبدء.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpenDialog}
                startIcon={<Add />}
              >
                إضافة معدات
              </Button>
            </Paper>
          )}
        </CardContent>
      </BlueCard>

      {/* طلبات التخزين */}
      <BlueCard>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main'
          }}>
            <RequestPage color="primary" /> طلبات التخزين
          </Typography>
          
          {demands.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {demands.map((demand, index) => (
                <React.Fragment key={demand._id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            طلب رقم #{demand._id.slice(-6).toUpperCase()}
                          </Typography>
                          <StatusChip 
                            label={demand.status === 'accepted' ? 'مقبول' : 
                                  demand.status === 'pending' ? 'قيد الانتظار' : 
                                  demand.status}
                            status={demand.status} 
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Box mt={1} mb={1}>
                            {demand.userDemandeur && (
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Avatar 
                                  src={demand.userDemandeur.image} 
                                  sx={{ width: 24, height: 24 }}
                                >
                                  {demand.userDemandeur.name?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="body2">
                                  {demand.userDemandeur.name || 'مستخدم غير معروف'} (ID: {demand.userDemandeur.userId})
                                </Typography>
                              </Box>
                            )}
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2">
                                  <strong>الكمية:</strong> {demand.quantity} كغ
                                </Typography>
                              </Grid>
                              
                              {demand.startDate && demand.endDate && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="body2">
                                    <strong>المدة:</strong> {new Date(demand.startDate).toLocaleDateString('ar-EG')} - {new Date(demand.endDate).toLocaleDateString('ar-EG')}
                                  </Typography>
                                </Grid>
                              )}
                              
                              <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2">
                                  <strong>النوع:</strong> {demand.type === 'standard' ? 'عادي' : demand.type === 'express' ? 'سريع' : demand.type}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            تاريخ الإنشاء: {new Date(demand.createdAt).toLocaleDateString('ar-EG')} الساعة {new Date(demand.createdAt).toLocaleTimeString('ar-EG')}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < demands.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                لا توجد طلبات تخزين لحسابك.
              </Typography>
            </Paper>
          )}
        </CardContent>
      </BlueCard>

      {/* نافذة إضافة معدات جديدة */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <React.Suspense fallback={
          <Box p={4} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        }>
          <CreateEquip onClose={handleCloseDialog} />
        </React.Suspense>
      </Dialog>
    </Box>
  );
};

export default Stockeur;