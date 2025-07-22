'use client';

import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Interfaces ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  purchase_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  category_id: number | null;
  is_active: 0 | 1;
  images: { id: number; image_url: string; created_at: string }[];
}

interface OrderFormProps {
  productId: number;
  productPrice: number;
  productName: string;
  apiBaseUrl: string;
}

// Algeria Provinces
const algeriaProvinces = [
  'Adrar', 'Ain Defla', 'Ain Temouchent', 'Alger', 'Annaba', 'Batna', 'Bechar', 'Bejaia', 'Biskra', 'Blida',
  'Bordj Bou Arreridj', 'Bouira', 'Boumerdes', 'Chlef', 'Constantine', 'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaia',
  'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat', 'Mascara', 'Medea', 'Mila', 'Mostaganem', "M'Sila",
  'Naama', 'Oran', 'Ouargla', 'Oum el Bouaghi', 'Relizane', 'Saida', 'Setif', 'Sidi Bel Abbes', 'Skikda', 'Souk Ahras',
  'Tamanghasset', 'Tebessa', 'Tiaret', 'Tindouf', 'Tipaza', 'Tissemsilt', 'Tizi Ouzou', 'Tlemcen', 'Ain Salah', 'Ain Guezzam',
  'Bordj Badji Mokhtar', 'Djanet', 'In Amenas', 'Timimoun', 'Touggourt', 'Beni Abbes', 'El Meniaa', 'Ouled Djellal',
];

// --- Order Form Component ---
const OrderForm: React.FC<OrderFormProps> = ({ productId, productName, apiBaseUrl }) => {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [pronouns, setPronouns] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [deliveryOption, setDeliveryOption] = useState<string>('desk');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const showTemporaryMessage = useCallback((message: string, type: 'success' | 'error') => {
    clearMessages();
    if (type === 'success') {
      setSuccessMessage(message);
    } else {
      setError(message);
    }
    setTimeout(clearMessages, 5000);
  }, []);

  // --- Corrected handleSubmit function inside the OrderForm component ---
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  clearMessages();

  if (!name || !phoneNumber || !state) {
      showTemporaryMessage('Customer Name, Phone Number, and State are required.', 'error');
      setLoading(false);
      return;
  }

  try {
      // --- 1. Hardcoded Credentials for Automatic Login ---
      // IMPORTANT: You MUST replace these with a valid user that exists in your backend database.
      const autoLoginEmail = 'admin@example.com'; // REPLACE WITH YOUR VALID EMAIL
      const autoLoginPassword = 'admin';   // REPLACE WITH YOUR VALID PASSWORD

      console.log('OrderForm: Attempting automatic login...');
      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Crucial for session-based login
          body: JSON.stringify({ email: autoLoginEmail, password: autoLoginPassword }),
      });

      if (!loginResponse.ok) {
          const loginData = await loginResponse.json();
          throw new Error(loginData.message || `Automatic login failed. Please check the hardcoded credentials.`);
      }
      
      console.log('OrderForm: Login successful! Proceeding to place order...');

      // --- 2. Prepare Order Data with the CORRECT Structure ---
      // ✅ FIX: The payload now matches the backend documentation.
      // It requires an `items` array and does not need user_id or total_price.
      const orderData = {
          shipping_address_id: 1, // Placeholder as per backend docs
          status: 'pending',
          items: [
              {
                  product_id: productId,
                  quantity: 1 // Assuming quantity is always 1 for this form
              }
          ]
      };

      console.log('OrderForm: Sending order data:', orderData);
      const orderResponse = await fetch(`${apiBaseUrl}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Sends the session cookie from login
          body: JSON.stringify(orderData),
      });

      const orderResponseData = await orderResponse.json();
      if (!orderResponse.ok) {
          // The backend provides detailed validation errors, so let's display them.
          const errorMessage = orderResponseData.message || `Failed to submit order: ${orderResponse.status}`;
          throw new Error(errorMessage);
      }

      showTemporaryMessage(`Order submitted successfully! Order ID: ${orderResponseData.id}`, 'success');

      // Clear form fields
      setName('');
      setPronouns('');
      setPhoneNumber('');
      setState('');
      setDeliveryOption('desk');

  } catch (err) {
      console.error('OrderForm: Error during login or order process:', err);
      showTemporaryMessage('Error: ' + (err instanceof Error ? err.message : String(err)), 'error');
  } finally {
      setLoading(false);
  }
};

  return (
    <div style={styles.orderFormContainer}>
      <h2 style={styles.orderFormHeading}>Place Your Order for {productName}</h2>
      {loading && <p style={styles.loadingMessage}>Processing...</p>}
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
            <label htmlFor="customerName" style={styles.label}>Your Name:</label>
            <input type="text" id="customerName" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} disabled={loading} />
        </div>
        <div style={styles.formGroup}>
            <label htmlFor="pronouns" style={styles.label}>Pronouns (Optional):</label>
            <input type="text" id="pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} style={styles.input} disabled={loading} />
        </div>
        <div style={styles.formGroup}>
            <label htmlFor="phoneNumber" style={styles.label}>Phone Number:</label>
            <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={styles.input} disabled={loading} />
        </div>
        <div style={styles.formGroup}>
            <label htmlFor="state" style={styles.label}>State (Wilaya):</label>
            <select id="state" value={state} onChange={(e) => setState(e.target.value)} required style={styles.select} disabled={loading}>
                <option value="">Select a state</option>
                {algeriaProvinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                ))}
            </select>
        </div>
        <div style={styles.formGroup}>
            <label style={styles.label}>Delivery Option:</label>
            <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                    <input type="radio" name="deliveryOption" value="desk" checked={deliveryOption === 'desk'} onChange={(e) => setDeliveryOption(e.target.value)} disabled={loading} />
                    Delivery Desk
                </label>
                <label style={styles.radioLabel}>
                    <input type="radio" name="deliveryOption" value="house" checked={deliveryOption === 'house'} onChange={(e) => setDeliveryOption(e.target.value)} disabled={loading} />
                    House
                </label>
            </div>
        </div>
        <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Submitting...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};


// --- Main Component ---
export default function SingleProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const apiBaseUrl = 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = 'https://shoppica-backend.onrender.com';
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const productData = await response.json();
        if (!productData || !productData.id) throw new Error('Invalid product data');
        setProduct(productData);
      } catch (err: unknown) {
        setError('Error fetching product: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, apiBaseUrl]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (loading) return <div style={styles.container}><p style={styles.loadingMessage}>Loading...</p></div>;
  if (error) return <div style={styles.container}><p style={styles.errorMessage}>{error}</p></div>;
  if (!product) return <div style={styles.container}><p>Product not found.</p></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.productTitle}>{product.name}</h1>
      <div style={styles.productDetails}>
        <div style={styles.productImageContainer}>
          {product.images?.[0]?.image_url ? (
            <Image
              src={`${staticBaseUrl}${product.images[0].image_url}`}
              alt={`${product.name} image`}
              fill
              priority
              sizes="(max-width: 400px) 100vw, 400px"
              style={{ objectFit: 'contain' }}
              onClick={() => handleImageClick(`${staticBaseUrl}${product.images[0].image_url}`)}
            />
          ) : (
            <Image
              src="https://placehold.co/500x500/cccccc/ffffff?text=No+Image"
              alt="No Image Available"
              fill
              sizes="(max-width: 400px) 100vw, 400px"
              style={{ objectFit: 'contain' }}
            />
          )}
        </div>
        <div style={styles.productInfo}>
          <p style={styles.productDescription}>{product.description}</p>
          <p style={styles.productPrice}>Price: ${product.price.toFixed(2)}</p>
          <p style={styles.productStock}>Stock: {product.stock_quantity}</p>
          {product.stock_quantity <= 0 && <p style={styles.outOfStock}>Out of Stock</p>}
        </div>
      </div>

      {product.stock_quantity > 0 ? (
        <OrderForm
          productId={product.id}
          productPrice={product.price}
          productName={product.name}
          apiBaseUrl={apiBaseUrl}
        />
      ) : (
        <p style={styles.outOfStockMessage}>This product is out of stock.</p>
      )}

      <button onClick={() => router.back()} style={styles.backButton}>Back to Products</button>

      {showImageModal && (
        <div style={styles.modal} onClick={() => setShowImageModal(false)}>
          <Image
            src={selectedImage}
            alt="Product"
            width={800} height={600}
            style={styles.modalImage}
          />
          <button onClick={() => setShowImageModal(false)} style={styles.closeButton}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// --- Inline Styles (No changes) ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  productTitle: {
    fontSize: '2.5em',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  productImageContainer: {
    position: 'relative', 
    width: '100%',
    maxWidth: '400px',
    height: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #eee',
  },
  productInfo: {
    width: '100%',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: '1.8em',
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  productDescription: {
    fontSize: '1em',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  productStock: {
    fontSize: '1.1em',
    color: '#666',
    fontWeight: 'bold',
  },
  outOfStock: {
    fontSize: '1.2em',
    color: '#dc3545',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  outOfStockMessage: {
    fontSize: '1.2em',
    color: '#dc3545',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8d7da',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginBottom: '20px',
  },
  backButton: {
    display: 'block',
    width: 'fit-content',
    margin: '20px auto 0',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  orderFormContainer: {
    backgroundColor: '#f9f9f9',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },
  orderFormHeading: {
    fontSize: '1.8em',
    color: '#2c3e50',
    marginBottom: '15px',
    textAlign: 'center',
  },
  form: {
    display: 'grid',
    gap: '15px',
  },
  formGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1em',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  submitButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  loadingMessage: {
    color: '#007bff',
    textAlign: 'center',
    marginBottom: '15px',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  successMessage: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '8px',
    objectFit: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
};