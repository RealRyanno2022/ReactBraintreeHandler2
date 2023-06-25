import React, { useEffect, useRef, useState } from 'react';
import dropin from "braintree-web-drop-in";
import { Button } from "reactstrap";
import './index.css';

const BraintreeDropIn = (props: any) => {
    const { onPaymentCompleted } = props;
    const braintreeInstance = useRef<dropin.Dropin | undefined>();
    const [authorization, setAuthorization] = useState('');

    // Request client token from server when component mounts
    useEffect(() => {
        fetch('https://candii4-backend2-3f9abaacb350.herokuapp.com/client_token')
            .then(res => res.text()) // Parse the response as text
            .then(setAuthorization); // Update state with client token
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

    return (
        <div id="container">
            <div id="braintree-drop-in-div" />
            <Button className="braintreePayButton" color="primary" disabled={!braintreeInstance.current} onClick={handleClick}>
                Pay
            </Button>
        </div>
    );
};

export default BraintreeDropIn;
