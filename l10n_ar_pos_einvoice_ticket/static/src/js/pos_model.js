odoo.define('l10n_ar_pos_einvoice_ticket', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    models.load_fields('res.partner', ['l10n_ar_afip_responsibility_type_id','l10n_latam_identification_type_id']);
    models.load_fields('res.company', [
        'l10n_ar_afip_start_date',
        'l10n_ar_gross_income_number',
        'l10n_ar_afip_responsibility_type_id',
        'street',
        'city',
        'state_id',
        'country_id',
    ]);

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({

         renderElement: function() {
            var self = this;
            this._super();

            if (this.pos.config.pos_auto_invoice) {
               this.$('.js_invoice').addClass('oe_hidden');
            }
        },


        initialize: function (attributes, options) {
            _super_Order.initialize.apply(this, arguments);
            if (this.pos.config.pos_auto_invoice) {
                this.to_invoice = true;

            }
        },
        init_from_JSON: function (json) {
            var res = _super_Order.init_from_JSON.apply(this, arguments);
            if (json.to_invoice) {
                this.to_invoice = json.to_invoice;

            }
        }
    });

    pos_model.PosModel = pos_model.PosModel.extend({

        _flush_orders: function(orders, options) {
            var self = this;
            var result, data;
            result = data = SuperPosModel._flush_orders.call(this,orders, options)
            _.each(orders,function(order){

                if (order.to_invoice)
                 var order = self.env.pos.get_order();
                //if (this.env.pos.config.receipt_invoice_number)
                    data.then(function(order_server_id){


                            rpc.query({
                            model: 'pos.order',
                            method: 'read',
                            domain: [['pos_reference', '=', order['name']]],
                            fields: ['account_move'],
                            args:[order_server_id, ['account_move','company_id']]
                                }).then(function(result_dict){

                                    if(result_dict.length){

                                        let invoice = result_dict[0].account_move;
                                        self.get_order().invoice_id = invoice[1];
                                        account_move = result_dict[0]['account_move'][0];
                                        company_id=result_dict[0]['company_id'][0];

                                    }
                            }).then(function (einvoices) {


                                     rpc.query({
                                         model: 'account.move',
                                         method: 'search_read',
                                         args: [[['id', '=', account_move]], ['l10n_ar_afip_auth_code',
                                                                            'l10n_ar_afip_auth_code_due',
                                                                            'l10n_ar_afip_barcode',
                                                                            'l10n_ar_afip_qr_code',
                                                                            'invoice_date_due',
                                                                            'l10n_latam_document_type_id',
                                                                            'company_id',
                                                                            ]],
                                        }

                                     ).then(function (einvoice) {

                                        if (account_move>0) {
                                         l10n_ar_afip_auth_code = einvoice[0]['l10n_ar_afip_auth_code'];
                                         l10n_ar_afip_qr_code= einvoice[0]['l10n_ar_afip_qr_code'];
                                         l10n_ar_afip_auth_code_due= einvoice[0]['l10n_ar_afip_auth_code_due'];
                                         //l10n_latam_document_type_id = einvoice[0]['l10n_latam_document_type_id'];
                                         l10n_latam_document_type_id = einvoice[0]['l10n_latam_document_type_id'][1].split(" ")[0];
                                         invoice_date_due= einvoice[0]['invoice_date_due'];
                                         var split_invoice_date_due=invoice_date_due.split('-');
                                         invoice_date_due=split_invoice_date_due[2]+"-"+split_invoice_date_due[1]+"-"+split_invoice_date_due[0];
                                         company_id=einvoice[0]['company_id'][0];
                                         }

                                        }).then(function (company) {

                                          rpc.query({
                                          model: 'res.company',
                                          method: 'search_read',
                                          args: [[['id', '=', company_id]], ['l10n_ar_afip_start_date','l10n_ar_gross_income_number','street', 'city', 'state_id', 'country_id', 'company_registry']],
                                    }).then(function (company_partner) {
                                        l10n_ar_afip_start_date=company_partner[0]['l10n_ar_afip_start_date'];
                                            if(l10n_ar_afip_start_date!=false){
                                                var split_l10n_ar_afip_start_date=l10n_ar_afip_start_date.split('-');
                                                l10n_ar_afip_start_date = split_l10n_ar_afip_start_date[2]+"-"+split_l10n_ar_afip_start_date[1]+"-"+split_l10n_ar_afip_start_date[0];
                                              }
                                        l10n_ar_gross_income_number=company_partner[0]['l10n_ar_gross_income_number'];
                                        street=company_partner[0]['street'];
                                        city=company_partner[0]['city'];

                                    })


                                        })


                                 }).catch(function(error){
                                return result
                            })
                    })
            })
            return result

        },

    })
    pos_model.Order = pos_model.Order.extend({
        export_for_printing: function(){
            var self = this
            var receipt = SuperOrder.export_for_printing.call(this)
            if(self.invoice_id){
                var invoice_id = self.invoice_id
                var invoice = invoice_id.split("(")[0]
                var invoice_number ="";
                var invoice_letter="";
                invoice_number = invoice_id.split("(")[0]
                invoice_letter = invoice_id.split("(")[0].substring(3, 4);
                //invoice_letter = orders[0]['account_move'][1].split(" ")[0].substring(3, 4);

                receipt.street=street
                receipt.city=city
                receipt.invoice_id = invoice
                receipt.invoice_number = invoice_number
                receipt.invoice_letter = invoice_letter
                receipt.l10n_ar_afip_auth_code=l10n_ar_afip_auth_code
                receipt.l10n_ar_afip_qr_code=l10n_ar_afip_qr_code
                receipt.l10n_ar_afip_auth_code_due=l10n_ar_afip_auth_code_due
                receipt.l10n_latam_document_type_id=l10n_latam_document_type_id
                receipt.invoice_date_due = invoice_date_due
                receipt.l10n_ar_afip_start_date=l10n_ar_afip_start_date
                receipt.l10n_ar_gross_income_number = l10n_ar_gross_income_number


            }
            return receipt
        }
    })

});
