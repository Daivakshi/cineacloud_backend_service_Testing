import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe;

    constructor(
        private config: ConfigService
    ) {
        this.stripe = new Stripe(config.get<string>('STRIPE_API_KEY'), {
            apiVersion: '2020-08-27'
        });
    };

    createCustomer(requestBody) {
        return this.stripe.customers.create({
            email: requestBody.email,
            name: `${requestBody.firstName} ${requestBody.lastName}`,
        });
    };

    // updateCustomer(requestBody) {
    //     return this.stripe.customers.update(requestBody.custId, {
    //         source: requestBody.stripeToken,
    //     });
    // };

    updateCustomer(custId, data) {
        return this.stripe.customers.update(custId, data);
    };

    getCustomerDetails(customer_id) {
        return this.stripe.customers.retrieve(customer_id);
    };

    getCardDetails(customer_id, card_id) {
        return this.stripe.customers.retrieveSource(customer_id, card_id);
    };

    createPaymentSource(cust_id, token) {
        return this.stripe.customers.createSource(cust_id, {
            source: token,
        });
    };

    updatePaymentSource(cust_id, payment_source, update_obj) {
        return this.stripe.customers.updateSource(cust_id, payment_source, update_obj);
    };

    deletePaymentSource(cust_id, payment_source) {
        return this.stripe.customers.deleteSource(cust_id, payment_source);
    };

    getAllCards(cust_id) {
        return this.stripe.customers.listSources(cust_id, { object: 'card', limit: 5 });
    };

    createToken(card_obj) {
        return this.stripe.tokens.create({ card: card_obj })
    };

    createCharge(pay_obj) {
        return this.stripe.charges.create(pay_obj)
    };

    capturePayment(payment_id) {
        return this.stripe.charges.capture(payment_id)
    };

    refundPayment(refund_obj) {
        return this.stripe.refunds.create(refund_obj)
    };

    createIntent(pay_obj) {
        return this.stripe.paymentIntents.create(pay_obj)
    };

    confirmIntent(pay_obj) {
        return this.stripe.paymentIntents.confirm(pay_obj);
    };

    captureIntent(payment_id) {
        return this.stripe.paymentIntents.capture(payment_id)
    };
};


