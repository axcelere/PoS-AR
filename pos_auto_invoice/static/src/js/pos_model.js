odoo.define('pos_auto_invoice', function (require) {

    var models = require('point_of_sale.models');
    //var screens = require('point_of_sale.screens');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var qweb = core.qweb;
    var _super_Order = models.Order.prototype;
    var _t = core._t;
    var { Gui } = require('point_of_sale.Gui');

    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            // DESDE ACA
            console.log('initialize');
            var journal_model = _.find(this.models, function (model) {
                return model.model === 'pos.payment.method';
            });

            console.log('journal_model', journal_model);
            journal_model.fields.push('line_ids');
            _super_PosModel.initialize.apply(this, arguments);

        },

        get_pos_auto_invoice: function (order) {
            var self = this;
            var payment_lines = order.get_paymentlines();
            var pos_auto_invoice = false;
            var invoiced_def = new $.Deferred();
            for (var i = 0; i < payment_lines.length; i++) {
                var journal_id = payment_lines[i];
                var payment_method_id = journal_id['payment_method']['id'];
                var pos_config_id = journal_id['pos']['config_id'];
                console.log('journal_id', journal_id);
                console.log('payment_method_id', payment_method_id);
                console.log('pos_config_id', pos_config_id);
                rpc.query({
                     model: 'pos.payment.method.line',
                     method: 'search_read',
                     args: [[['payment_method_id', '=', payment_method_id],
                             ['pos_config_id', '=', pos_config_id]], ['type']],
                    }).then(function (company_journal0) {
                    console.log('xxxxxx.............');
                    console.log(company_journal0);
                    if (company_journal0.length==0) {
                        self.gui.show_popup('error',{
                            'title': "Error: Metodo de pago",
                            'body':  'Falta elegir la modalidad del metodo de pago seleccionado (manual/cta. cte)',
                        });
                        return;
                    }
                    if (company_journal0[0]['type']==='cta_cte'){
                        pos_auto_invoice = true;
                        console.log('if....',pos_auto_invoice);
                        this.$('.js_invoice').addClass('highlight');
                    }
                    else{
                        // ojo! no se que puede pasar con esto cuando selecciones más de un método de pago
                        console.log('else....',pos_auto_invoice);
                    }
                    console.log('-------------', pos_auto_invoice);
                    invoiced_def.resolve(pos_auto_invoice);
                })
            }
            return invoiced_def;
        },

        get_pos_auto_amount: function (order) {
            console.log('get_pos_auto_amount');
            var self = this;
            var payment_lines = order.get_paymentlines();
            var pos_auto_invoice = false;
            var invoiced_def = new $.Deferred();
            for (var i = 0; i < payment_lines.length; i++) {
                var journal_id = payment_lines[i];
                var payment_method_id = journal_id['payment_method']['id'];
                var pos_config_id = journal_id['pos']['config_id'];
                console.log('journal_id', journal_id);
                console.log('payment_method_id', payment_method_id);
                console.log('pos_config_id', pos_config_id);
                rpc.query({
                     model: 'pos.payment.method.line',
                     method: 'search_read',
                     args: [[['payment_method_id', '=', payment_method_id],
                             ['pos_config_id', '=', pos_config_id]], ['invoice_amount']],
                    }).then(function (company_journal1) {
                        console.log('.............');
                        console.log('company_journal1',company_journal1);
                        console.log('company_journal1.length',company_journal1.length);
                        if (company_journal1.length==0) {

                            // self.gui.show_popup('error',{
                            //     'title': "Error: Metodo de pago",
                            //     'body':  'Falta elegir la modalidad del metodo de pago seleccionado (manual/cta. cte)',
                            // });
                            // return;
                            console.log('showPopup')
                            Gui.showPopup('ConfirmPopup', {
                                title: 'Error: Metodo de pago',
                                body: 'Falta elegir la modalidad del metodo de pago seleccionado (manual/cta. cte)'
                            });
                            invoiced_def.resolve(-1);
                        }
                        else {
                            console.log(company_journal1[0]['invoice_amount']);
                            invoiced_def.resolve(company_journal1[0]['invoice_amount']);
                        }

                    })
            }
            return invoiced_def.promise();
        },

    });

});
