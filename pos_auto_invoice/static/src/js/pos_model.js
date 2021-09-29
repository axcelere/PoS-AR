odoo.define('pos_auto_invoice', function (require) {

    var models = require('point_of_sale.models');
    //var screens = require('point_of_sale.screens');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var qweb = core.qweb;
    var _super_Order = models.Order.prototype;
    var _t = core._t;

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
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
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
                    }).then(function (company_journal) {
                    console.log('xxxxxx.............');
                    console.log(company_journal);
                    if (company_journal.length==0) {
                        self.gui.show_popup('error',{
                            'title': "Error: Metodo de pago",
                            'body':  'Falta elegir la modalidad del metodo de pago seleccionado (manual/cta. cte)',
                        });
                        // self.gui.show_popup('error',_t('Falta elegir la modalidad del metodo (manual/cta. cte) de pago seleccionado'));
                        return;
                    }
                    if (company_journal[0]['type']==='cta_cte'){
                        pos_auto_invoice = true;
                        console.log('if....',pos_auto_invoice);
                        this.$('.js_invoice').addClass('highlight');
                        //invoiced_def.resolve(pos_auto_invoice);

                    }
                    else{
                        // ojo! no se que puede pasar con esto cuando selecciones más de un método de pago
                        console.log('else....',pos_auto_invoice);
                        //invoiced_def.resolve(pos_auto_invoice);
                    }
                    console.log('-------------', pos_auto_invoice);
                    invoiced_def.resolve(pos_auto_invoice);
                })
                // .fail(function(xhr, textStatus, errorThrown){
                //     self.message_error_printer_fiscal('Comunicación fallida con el Proxy')
                //     def.reject();
                //     });
            }
            /*if (!pos_auto_invoice){
                console.log('else.... false');
                console.log(pos_auto_invoice);
                invoiced_def.reject();
                return invoiced_def;
            }*/
            return invoiced_def;
        },

    });

});
