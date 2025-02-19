import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Box, IconButton, Collapse } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { QRCodeSVG } from 'qrcode.react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const toTitleCase = (str) =>
  str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const renderField = (key, value) => {
  if (Array.isArray(value)) {
    return value.map((item, idx) => (
      <Box key={`${key}-${idx}`} sx={{ marginBottom: 1, textAlign: 'left' }}>
        {renderField(`${key}-${idx}`, item)}
      </Box>
    ));
  } else if (typeof value === 'object' && value !== null) {
    return (
      <Box sx={{ marginBottom: 1, textAlign: 'left' }}>
        {Object.entries(value).map(([subKey, subValue]) => (
          <Box key={subKey} sx={{ marginBottom: 1 }}>
            {renderField(subKey, subValue)}
          </Box>
        ))}
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginBottom: 1 }}>
      <Typography variant="body2" fontWeight="bold" gutterBottom>{toTitleCase(key)}</Typography>
      <Typography variant="body2" sx={{ textAlign: 'left', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{value}</Typography>
    </Box>
  );
};

const PatientSmartCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  if (!data || typeof data !== 'object') {
    console.error('Invalid data format: Expected an object.');
    return <Typography color="error">Invalid data provided.</Typography>;
  }

  const { header, payload, isVerified, qrCode } = data;
  const vc = payload?.vc || {};
  const patient = vc.credentialSubject?.fhirBundle?.entry?.find((entry) => entry.resource.resourceType === 'Patient')?.resource;
  const otherEntries = vc.credentialSubject?.fhirBundle?.entry?.filter((entry) => entry.resource.resourceType !== 'Patient') || [];

  return (
    <Card sx={{ margin: 2, padding: 2, boxShadow: 3, borderRadius: 2, textAlign: 'left' }}>
      <CardHeader 
        title="SMART Health Card" 
        subheader={<Typography sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{payload?.iss ? `Issuer: ${payload.iss}` : 'Issuer: N/A'}</Typography>} 
        action={
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <CardContent>
        {patient && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="h6">Patient Details</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left' }}><strong>Name:</strong><br /> {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'left' }}><strong>Birth Date:</strong><br /> {patient.birthDate}</Typography>
          </Box>
        )}

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6" sx={{ marginTop: 2, textAlign: 'left' }}>Verification Status</Typography>
          <Typography variant="body1" sx={{ color: isVerified ? 'success.main' : 'error.main', textAlign: 'left' }}>{isVerified ? 'Verified' : 'Not Verified'}</Typography>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {qrCode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2, width: '100%' }}>
              <QRCodeSVG value={qrCode} style={{ width: '100%', height: 'auto' }} />
            </Box>
          )}

          <Typography variant="h6" sx={{ marginTop: 2, textAlign: 'left' }}>Entries</Typography>
          <Grid container spacing={2} sx={{ marginTop: 1 }}>
            {otherEntries.map((entry, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Resource Type: {toTitleCase(entry.resource.resourceType)}</Typography>
                  {Object.entries(entry.resource).map(([key, value]) => renderField(key, value))}
                </Box>
              </Grid>
            ))}
          </Grid>

          
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PatientSmartCard;
