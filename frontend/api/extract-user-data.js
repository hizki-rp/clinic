// Simple API endpoint for Google AI extraction
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { frontPhotoDataUri, backPhotoDataUri } = req.body;

    if (!frontPhotoDataUri && !backPhotoDataUri) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    // Mock response - replace with actual Google AI call
    const extractedData = {
      name: 'John Doe',
      email: 'john.doe@email.com', 
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, City, State 12345'
    };

    res.status(200).json(extractedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract data' });
  }
}