import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { styles } from '../styles';

function RegisterModal({ show, onClose }) {
    const { registerWithPayment, createOrder } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        teamName: '',
        member2: '',
        member3: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    const { name, email, password, password2, teamName, member2, member3 } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // Function to handle the successful payment response
    const handlePaymentSuccess = async (response, registrationData) => {
        // Step 4 & 5: Payment success, now call the final registration API
        const finalRegistrationData = {
            ...registrationData,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
        };

        const result = await registerWithPayment(finalRegistrationData);

        if (result.success) {
            onClose(); // Close modal on successful registration
        } else {
            setError(result.error || 'Payment successful, but registration failed.');
        }
        setLoading(false);
    };

    // Function to launch the Razorpay payment widget
    const displayRazorpay = (order, registrationData) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use your public key
            amount: order.amount,
            currency: order.currency,
            name: "Hackathon 2026",
            description: `Team Registration for ${registrationData.teamName}`,
            order_id: order.id,
            handler: function (response) {
                handlePaymentSuccess(response, registrationData);
            },
            prefill: {
                name: registrationData.name,
                email: registrationData.email,
            },
            theme: {
                color: "#3399cc"
            },
            
            // --- ★★★ THIS IS THE FIX ★★★ ---
            modal: {
                ondismiss: function() {
                    console.log('Razorpay modal closed by user (cancellation).');
                    setLoading(false); // 1. Reset the "Processing..." button
                    onClose(); // 2. Close the register modal
                    alert('Payment was canceled.'); // 3. Show the alert
                }
            }
            // --- ★★★ END OF FIX ★★★ ---
        };

        const paymentObject = new window.Razorpay(options);
        
        // This handles when a payment *fails*, which is different from a *cancellation*.
        // We'll also make it close the modal and alert the user.
        paymentObject.on('payment.failed', function (response) {
            console.log('Razorpay payment failed.');
            setLoading(false); // Reset the button
            onClose(); // Close the register modal
            alert(`Payment failed: ${response.error.description}. Please try again.`);
        });
        
        paymentObject.open();
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== password2) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const teamMembers = [member2, member3].filter(Boolean);
        
        const registrationData = {
            name,
            email,
            password,
            teamName,
            teamMembers,
        };

        try {
            // Step 2: Call the server to create a Razorpay Order
            const orderResult = await createOrder(registrationData);

            if (orderResult.success) {
                // Step 3: Launch Razorpay
                displayRazorpay(orderResult.order, registrationData);
            } else {
                setError(orderResult.error || 'Failed to create payment order.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred during payment initiation.');
            setLoading(false);
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2>Register Team</h2>
                    <button style={styles.modalCloseButton} onClick={onClose}>
                        &times;
                    </button>
                </div>
                <form style={styles.modalForm} onSubmit={onSubmit}>
                    {error && <p style={styles.modalError}>{error}</p>}
                    <p style={styles.modalSubtitle}>Your Details (Team Leader)</p>
                    <input type="text" name="name" value={name} onChange={onChange} placeholder="Your Full Name" style={styles.modalInput} required />
                    <input type="email" name="email" value={email} onChange={onChange} placeholder="Your Email Address" style={styles.modalInput} required />
                    <input type="password" name="password" value={password} onChange={onChange} placeholder="Password (min 6 characters)" style={styles.modalInput} minLength="6" required />
                    <input type="password" name="password2" value={password2} onChange={onChange} placeholder="Confirm Password" style={styles.modalInput} minLength="6" required />
                    <p style={styles.modalSubtitle}>Team Details (Max 3 Members Total)</p>
                    <input type="text" name="teamName" value={teamName} onChange={onChange} placeholder="Team Name" style={styles.modalInput} required />
                    <input type="text" name="member2" value={member2} onChange={onChange} placeholder="Team Member 2 Name (Optional)" style={styles.modalInput} />
                    <input type="text" name="member3" value={member3} onChange={onChange} placeholder="Team Member 3 Name (Optional)" style={styles.modalInput} />
                    
                    <button type="submit" style={styles.modalSubmitButton} disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Payment & Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterModal;