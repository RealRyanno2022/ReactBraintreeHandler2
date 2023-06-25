import React, { useEffect, useState } from 'react';
import dropin from "braintree-web-drop-in";
import { Button } from "reactstrap";
import './index.css';

const BraintreeDropIn = (props: any) => {
    const { show, onPaymentCompleted } = props;
    const [braintreeInstance, setBraintreeInstance] = useState<dropin.Dropin | undefined>(undefined);

    useEffect(() => {
        if (show) {
            const initializeBraintree = () => {
                dropin.create({
                    authorization: "sandbox_s9gd7m2p_vp62s592633kc5p5",
                    container: '#braintree-drop-in-div',
                }, (error, instance) => {
                    if (error) console.error(error);
                    else setBraintreeInstance(instance);
                });
            };

            braintreeInstance ? braintreeInstance.teardown().then(initializeBraintree) : initializeBraintree();
        }
    }, [show]);

    const handleClick = () => {
        if (braintreeInstance) {
            braintreeInstance.requestPaymentMethod((error: any, payload: any) => {
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
        <div style={{ display: show ? "block" : "none" }}>
            <div id="braintree-drop-in-div" />
            <Button className="braintreePayButton" color="primary" disabled={!braintreeInstance} onClick={handleClick}>
                Pay
            </Button>
        </div>
    );
};

export default BraintreeDropIn;