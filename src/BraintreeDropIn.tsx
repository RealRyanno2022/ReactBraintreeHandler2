import React, { useEffect, useRef, useState } from 'react';
import dropin from "braintree-web-drop-in";
import * as Linking from 'expo-linking';
import { Button } from "reactstrap";
import './index.css';

const BraintreeDropIn = (props: any) => {
    const { onPaymentCompleted } = props;
    const braintreeInstance = useRef<dropin.Dropin | undefined>();
    const [authorization, setAuthorization] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Request client token from server when component mounts
    useEffect(() => {
        fetch('https://candii4-backend2-3f9abaacb350.herokuapp.com/client_token')
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch client token");
                }
                return res.text();
            }) // Parse the response as text
            .then(setAuthorization) // Update state with client token
            .catch(error => {
                setError(error.message);
            });
    }, []);

    useEffect(() => {
        if (authorization) {
            const initializeBraintree = () => {
                dropin.create({
                    authorization,
                    container: '#braintree-drop-in-div',
                }, (error, instance) => {
                    if (error) console.error(error);
                    else braintreeInstance.current = instance;
                });
            };

            if (braintreeInstance.current) {
                braintreeInstance.current.teardown().then(initializeBraintree);
            } else {
                initializeBraintree();
            }
        }
    }, [authorization]);

    const handleClick = () => {
        if (braintreeInstance.current) {
            braintreeInstance.current.requestPaymentMethod((error: any, payload: any) => {
                if (error) console.error(error);
                else {
                    const paymentMethodNonce = payload.nonce;
                    console.log("payment method nonce", payload.nonce);
                    alert(`Payment completed with nonce=${paymentMethodNonce}`);
                    onPaymentCompleted();
                }
            });
        }
    };

    const handleBackClick = () => {
        // Redirect back to your app
        Linking.openURL('your-app-scheme://ConfirmationPage');
    };

    return (
        <div id="container">
            {error ? (
                <div>
                    <p>An error occurred. Try again!</p>
                    <Button onClick={handleBackClick}>Back to App</Button>
                </div>
            ) : (
                <>
                    <div id="braintree-drop-in-div" />
                    <Button className="braintreePayButton" color="primary" disabled={!braintreeInstance.current} onClick={handleClick}>
                        Pay
                    </Button>
                </>
            )}
        </div>
    );
};

export default BraintreeDropIn;
