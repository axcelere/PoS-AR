odoo.define('pos_auto_invoice.screens', function(require) {
    'use strict';

    console.log('pos_auto_invoice.screens');

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    var rpc = require('web.rpc');

    const PosInvPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            /**
             * @override
             */

            constructor() {
                super(...arguments);
            }

            async _finalizeValidation() {
                // if (this.env.pos.config.use_fiscal_printer){
                // var response = this.env.pos.print_pos_ticket();
                // localStorage['go_nc']='0';
                // }
                console.log('pos_auto_invoice _finalizeValidation')
                var self = this;
                var order = this.currentOrder
                /*this._super();*/
                //var _super=this._super.bind(this);
                console.log('order',order);
                await $.when(this.env.pos.get_pos_auto_invoice(order)
                ).then(function(pos_auto_invoice) {
                    console.log('pos_auto_invoice', pos_auto_invoice);
                    if (pos_auto_invoice) {
                        console.log('pos_auto_invoice trueee');
                        //this.$('.js_invoice').addClass('highlight');
                        console.log('this', this);
                        //this.$('.js_invoice').addClass('oe_hidden');
                        order.to_invoice = true;
                        order.set_to_invoice(true);
                        // if(!order.get_client()){
                        //     console.log('Missing Customer');
                        //     console.log('this',this);
                        //     const { confirmed } =  this.showPopup('ConfirmPopup', {
                        //         title: this.env._t('Please select the Customer'),
                        //         body: this.env._t(
                        //             'You need to select the customer before you can invoice an order.'
                        //         ),
                        //     });
                        //     if (confirmed) {
                        //         this.selectClient();
                        //     }
                        // }
                    }
                    else if (!order.to_invoice) {
                        console.log('pos_auto_invoice falseee');
                        order.is_tax_free_order=true;
                    }
                })
                await super._finalizeValidation();
            }

            async _isOrderValid(isForceValidate) {
                var res = super._isOrderValid(...arguments);
                var self = this;
                var order = this.currentOrder;
                var client = this.currentOrder.get_client();
                await $.when(this.env.pos.get_pos_auto_amount(order)
                ).then(function(pos_auto_invoice) {
                    console.log('pos_auto_invoice222222', pos_auto_invoice);
                    console.log('order.get_total_with_tax()', order.get_total_with_tax());
                    if (order.is_to_invoice() && client && !client.vat && order.get_total_with_tax() > pos_auto_invoice) {
                        console.log('Missing Customer Vat');
                        console.log('this', this);
                        console.log('self', self);
                        //rejectInvoiced({code:400, message:'Missing Customer Vat', data:{}});
                        //return res;
                        self.showPopup('ConfirmPopup', {
                            title: 'Falta el Cuit del Cliente',
                            body: 'El Cuit es requerido ya que la facturación supera los $ ' + pos_auto_invoice,
                        });
                        res = false
                        return res;
                    }
                    else{console.log('entre por el else....'); return res}
                })
                return res;
                //await super._isOrderValid(isForceValidate);
            }
        };

    Registries.Component.extend(PaymentScreen, PosInvPaymentScreen);

    return PosInvPaymentScreen;
});
